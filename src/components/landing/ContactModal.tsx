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
            title={isSuccess ? "LINK STABILIZED" : "Contact Sales Protocol"}
            description={
                isSuccess
                    ? "We've received your uplink and will transmit a response within 24 standard cycles."
                    : "Have questions about our Team plan or enterprise solutions? Initialize a communication line."
            }
        >
            {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="h-20 w-20 rounded-2xl bg-electric-cyan/20 text-electric-cyan flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(9,183,180,0.3)] animate-pulse">
                        <svg
                            className="h-10 w-10"
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
                    <Button onClick={onClose} variant="outline" className="border-electric-cyan/20 text-white hover:bg-white/5 uppercase tracking-widest text-xs font-bold">
                        Terminate Session
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <FormField label="First Name" required className="text-white">
                            <Input placeholder="John" required className="bg-deep-teal/20 border-white/10 text-white placeholder:text-dusty-rose/20" />
                        </FormField>
                        <FormField label="Last Name" required className="text-white">
                            <Input placeholder="Doe" required className="bg-deep-teal/20 border-white/10 text-white placeholder:text-dusty-rose/20" />
                        </FormField>
                    </div>
                    <FormField label="Identity Link (Email)" required className="text-white">
                        <Input type="email" placeholder="john@company.com" required className="bg-deep-teal/20 border-white/10 text-white placeholder:text-dusty-rose/20" />
                    </FormField>
                    <FormField label="Organization" required className="text-white">
                        <Input placeholder="Acme Inc." required className="bg-deep-teal/20 border-white/10 text-white placeholder:text-dusty-rose/20" />
                    </FormField>
                    <FormField label="Protocol Subject" required className="text-white">
                        <Select required className="bg-deep-teal/20 border-white/10 text-white">
                            <option value="" className="bg-midnight text-white">Select a subject...</option>
                            <option value="sales" className="bg-midnight text-white">Sales Inquiry</option>
                            <option value="support" className="bg-midnight text-white">Technical Support</option>
                            <option value="partnership" className="bg-midnight text-white">Partnership</option>
                            <option value="other" className="bg-midnight text-white">Other</option>
                        </Select>
                    </FormField>
                    <FormField label="Transmission Message" required className="text-white">
                        <Textarea
                            placeholder="Describe your requirements..."
                            className="min-h-[120px] bg-deep-teal/20 border-white/10 text-white placeholder:text-dusty-rose/20"
                            required
                        />
                    </FormField>
                    <Button type="submit" className="w-full h-14 btn-gradient text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl glow-sm hover:glow-md" isLoading={isLoading}>
                        Transmit Data
                    </Button>
                </form>
            )}
        </Modal>
    );
}
