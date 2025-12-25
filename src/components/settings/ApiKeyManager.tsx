"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Key, Plus, Copy, Check, Trash2, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ApiKey {
    id: string;
    key_prefix: string;
    name: string;
    last_used_at: string | null;
    created_at: string;
    revoked_at: string | null;
}

interface ApiKeyManagerProps {
    apiKeys: ApiKey[];
    onGenerate: (name: string) => Promise<{ key: string; id: string } | null>;
    onRevoke: (id: string) => Promise<boolean>;
    isLoading?: boolean;
    hasMcpAccess: boolean;
}

export function ApiKeyManager({
    apiKeys,
    onGenerate,
    onRevoke,
    isLoading,
    hasMcpAccess,
}: ApiKeyManagerProps) {
    const [isGenerateModalOpen, setIsGenerateModalOpen] = React.useState(false);
    const [newKeyName, setNewKeyName] = React.useState("");
    const [generatedKey, setGeneratedKey] = React.useState<string | null>(null);
    const [copied, setCopied] = React.useState(false);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [revokeConfirmId, setRevokeConfirmId] = React.useState<string | null>(null);

    const handleGenerate = async () => {
        if (!newKeyName.trim()) return;
        setIsGenerating(true);

        const result = await onGenerate(newKeyName.trim());

        if (result) {
            setGeneratedKey(result.key);
            setNewKeyName("");
        }
        setIsGenerating(false);
    };

    const handleCopy = async () => {
        if (!generatedKey) return;
        await navigator.clipboard.writeText(generatedKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRevoke = async (id: string) => {
        await onRevoke(id);
        setRevokeConfirmId(null);
    };

    const closeGenerateModal = () => {
        setIsGenerateModalOpen(false);
        setNewKeyName("");
        setGeneratedKey(null);
        setCopied(false);
    };

    const activeKeys = apiKeys.filter(k => !k.revoked_at);
    const revokedKeys = apiKeys.filter(k => k.revoked_at);

    if (!hasMcpAccess) {
        return (
            <Card className="border-warning bg-warning/5">
                <CardContent className="py-8 text-center">
                    <Key className="h-12 w-12 text-warning mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">API Keys Require Pro Plan</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        Upgrade to Pro or higher to generate API keys for MCP integration with Cursor and other IDEs.
                    </p>
                    <Button>Upgrade to Pro</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>API Keys</CardTitle>
                            <CardDescription>
                                Manage API keys for MCP integration with Cursor and other IDEs.
                            </CardDescription>
                        </div>
                        <Button onClick={() => setIsGenerateModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Generate New Key
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {activeKeys.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Key className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p>No API keys yet</p>
                            <p className="text-sm mt-1">Generate your first key to use with MCP</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeKeys.map((key) => (
                                <div
                                    key={key.id}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Key className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{key.name}</p>
                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                                                    {key.key_prefix}
                                                </code>
                                                <span>•</span>
                                                <span>
                                                    {key.last_used_at
                                                        ? `Last used ${formatDate(key.last_used_at)}`
                                                        : "Never used"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => setRevokeConfirmId(key.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {revokedKeys.length > 0 && (
                        <div className="mt-6 pt-6 border-t">
                            <p className="text-sm font-medium text-muted-foreground mb-3">Revoked Keys</p>
                            <div className="space-y-2">
                                {revokedKeys.map((key) => (
                                    <div
                                        key={key.id}
                                        className="flex items-center justify-between p-3 border rounded-lg opacity-50"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Key className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{key.name}</span>
                                            <code className="text-xs text-muted-foreground">{key.key_prefix}</code>
                                        </div>
                                        <Badge variant="destructive" className="text-[10px]">Revoked</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Generate Key Modal */}
            <Modal
                isOpen={isGenerateModalOpen}
                onClose={closeGenerateModal}
                title={generatedKey ? "API Key Generated" : "Generate New API Key"}
            >
                {!generatedKey ? (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Key Name</label>
                            <Input
                                placeholder="e.g., My Cursor Key"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                Give this key a memorable name so you can identify it later.
                            </p>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={closeGenerateModal}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleGenerate}
                                disabled={!newKeyName.trim()}
                                isLoading={isGenerating}
                            >
                                Generate Key
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm text-warning">Save this key now!</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        This is the only time you'll see this key. Copy it and store it securely.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <code className="block w-full p-4 bg-muted rounded-lg text-sm font-mono break-all">
                                {generatedKey}
                            </code>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="absolute top-2 right-2"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3 w-3 mr-1" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3 mr-1" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={closeGenerateModal}>Done</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Revoke Confirmation Modal */}
            <Modal
                isOpen={!!revokeConfirmId}
                onClose={() => setRevokeConfirmId(null)}
                title="Revoke API Key"
            >
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        Are you sure you want to revoke this API key? Any applications using it will immediately lose access.
                    </p>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setRevokeConfirmId(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => revokeConfirmId && handleRevoke(revokeConfirmId)}
                        >
                            Revoke Key
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
