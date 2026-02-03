import mongoose from 'mongoose';
import dns from 'dns';
import { promisify } from 'util';

// Force Google DNS to bypass ISP DNS SRV blocking
try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
    console.warn('Could not set DNS servers:', e);
}

const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);

interface MongooseCache {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;




const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
    global.mongooseCache = cached;
}

/**
 * Convert mongodb+srv:// URI to standard mongodb:// URI by manually resolving SRV records
 */
async function resolveSrvUri(srvUri: string): Promise<string> {
    try {
        const url = new URL(srvUri);

        if (url.protocol !== 'mongodb+srv:') {
            return srvUri; // Already a standard URI
        }

        const hostname = url.hostname;
        const srvDomain = `_mongodb._tcp.${hostname}`;

        // Resolve SRV records
        const srvRecords = await resolveSrv(srvDomain);

        if (!srvRecords || srvRecords.length === 0) {
            throw new Error('No SRV records found');
        }

        // Build hosts string from SRV records
        const hosts = srvRecords
            .sort((a, b) => a.priority - b.priority || b.weight - a.weight)
            .map(record => `${record.name}:${record.port}`)
            .join(',');

        // Try to get TXT records for options (optional)
        let txtOptions = '';
        try {
            const txtRecords = await resolveTxt(hostname);
            if (txtRecords && txtRecords.length > 0) {
                txtOptions = txtRecords[0].join('');
            }
        } catch {
            // TXT records are optional
        }

        // Build standard URI
        const auth = url.username ? `${url.username}:${url.password}@` : '';
        const database = url.pathname.slice(1) || '';
        const existingParams = url.search ? url.search.slice(1) : '';

        // Combine txt options with existing params
        let params = 'ssl=true';
        if (txtOptions) params += `&${txtOptions}`;
        if (existingParams) params += `&${existingParams}`;

        const standardUri = `mongodb://${auth}${hosts}/${database}?${params}`;

        return standardUri;
    } catch (error) {
        console.error('SRV resolution failed:', error);
        throw error;
    }
}

async function dbConnect(retries = 3): Promise<mongoose.Mongoose> {
    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable');
    }
    if (cached.conn) {
        if (cached.conn.connection.readyState === 1) {
            return cached.conn;
        }
        // Force reconnection if connection is not ready
        cached.conn = null;
        cached.promise = null;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
        };

        // Try to resolve SRV manually if driver fails
        let uri = MONGODB_URI as string;
        if (uri.startsWith('mongodb+srv://')) {
            try {
                uri = await resolveSrvUri(uri);
            } catch (e) {
                console.error('Failed to manually resolve SRV:', e);
                throw new Error('DNS Resolution Failed for MongoDB SRV Record');
            }
        }

        cached.promise = mongoose.connect(uri, opts);
    }

    try {
        cached.conn = await cached.promise;
    } catch (e: any) {
        cached.promise = null;

        // Retry on connection errors
        if (retries > 0 && (e.message?.includes('ECONNREFUSED') || e.message?.includes('querySrv') || e.message?.includes('ENOTFOUND'))) {
            console.log(`MongoDB connection failed, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return dbConnect(retries - 1);
        }

        throw e;
    }

    return cached.conn;
}

export default dbConnect;
