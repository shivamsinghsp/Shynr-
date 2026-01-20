// Auth pages have no navbar/footer - minimal layout
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
