"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/forms/FormField";
import { Select } from "@/components/ui/Select";

export function ContactModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsLoading(false);
        setIsSuccess(true);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                onClose();
                if (isSuccess) setIsSuccess(false);
            }}
            title={isSuccess ? "Message Sent!" : "Contact Sales"}
            description={
                isSuccess
                    ? "We've received your message and will get back to you within 24 hours."
                    : "Have questions about our Team plan or enterprise solutions? We're here to help."
            }
        >
            {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="h-16 w-16 rounded-full bg-success/20 text-success flex items-center justify-center mb-6">
                        <svg
                            className="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <Button onClick={onClose} variant="outline">
                        Close Modal
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="First Name" required>
                            <Input placeholder="John" required />
                        </FormField>
                        <FormField label="Last Name" required>
                            <Input placeholder="Doe" required />
                        </FormField>
                    </div>
                    <FormField label="Work Email" required>
                        <Input type="email" placeholder="john@company.com" required />
                    </FormField>
                    <FormField label="Company" required>
                        <Input placeholder="Acme Inc." required />
                    </FormField>
                    <FormField label="Subject" required>
                        <Select required>
                            <option value="">Select a subject...</option>
                            <option value="sales">Sales Inquiry</option>
                            <option value="support">Technical Support</option>
                            <option value="partnership">Partnership</option>
                            <option value="other">Other</option>
                        </Select>
                    </FormField>
                    <FormField label="Message" required>
                        <Textarea
                            placeholder="Tell us about your needs..."
                            className="min-h-[120px]"
                            required
                        />
                    </FormField>
                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Send Message
                    </Button>
                </form>
            )}
        </Modal>
    );
}
