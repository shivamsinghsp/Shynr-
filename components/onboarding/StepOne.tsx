"use client";

import { useState } from "react";

interface StepOneProps {
    data: {
        firstName: string;
        lastName: string;
        phone: string;
        location: string;
        address: {
            street: string;
            city: string;
            state: string;
            country: string;
            zipCode: string;
        };
    };
    onChange: (data: StepOneProps["data"]) => void;
}

export default function StepOne({ data, onChange }: StepOneProps) {
    const [formData, setFormData] = useState(data);

    const handleChange = (field: string, value: string) => {
        const newData = { ...formData };
        if (field.startsWith("address.")) {
            const addressField = field.replace("address.", "") as keyof typeof formData.address;
            newData.address = { ...newData.address, [addressField]: value };
        } else if (field === 'firstName') {
            newData.firstName = value;
        } else if (field === 'lastName') {
            newData.lastName = value;
        } else if (field === 'phone') {
            newData.phone = value;
        } else if (field === 'location') {
            newData.location = value;
        }
        setFormData(newData);
        onChange(newData);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
                <p className="text-gray-600">Tell us a little about yourself</p>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                    </label>
                    <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                        placeholder="John"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                    </label>
                    <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                        placeholder="Doe"
                    />
                </div>
            </div>

            {/* Phone */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                </label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                    placeholder="+1 (555) 000-0000"
                />
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (City, Country)
                </label>
                <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                    placeholder="San Francisco, USA"
                />
            </div>

            {/* Address */}
            <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Address (Optional)</h3>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => handleChange("address.street", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                        placeholder="Street Address"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            value={formData.address.city}
                            onChange={(e) => handleChange("address.city", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                            placeholder="City"
                        />
                        <input
                            type="text"
                            value={formData.address.state}
                            onChange={(e) => handleChange("address.state", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                            placeholder="State"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            value={formData.address.country}
                            onChange={(e) => handleChange("address.country", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                            placeholder="Country"
                        />
                        <input
                            type="text"
                            value={formData.address.zipCode}
                            onChange={(e) => handleChange("address.zipCode", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                            placeholder="ZIP Code"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
