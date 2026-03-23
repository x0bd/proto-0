"use client"

import * as React from "react"
import { SectionCard } from "@/components/ui/section-card"
import { SettingsRow } from "@/components/ui/settings-row"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { InlineHint } from "@/components/ui/inline-hint"
import { EmptyState } from "@/components/ui/empty-state"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Eye, EyeOff, Lock, KeyRound, Plus, Trash2, Check, AlertCircle } from "lucide-react"

// Mock types for UI only
type ProviderStatus = "configured" | "missing" | "invalid"

interface KeyEntry {
  id: string
  provider: string
  status: ProviderStatus
  isSessionOnly: boolean
  lastUsed?: string
}

export function KeyVaultPanel() {
  const [isUnlocked, setIsUnlocked] = React.useState(false)
  const [passphrase, setPassphrase] = React.useState("")

  const [keys, setKeys] = React.useState<KeyEntry[]>([
    { id: "1", provider: "OpenAI", status: "configured", isSessionOnly: false, lastUsed: "Just now" },
    { id: "2", provider: "ElevenLabs", status: "configured", isSessionOnly: true, lastUsed: "2 mins ago" }
  ])

  const [editingProvider, setEditingProvider] = React.useState<string | null>(null)
  const [newKeyValue, setNewKeyValue] = React.useState("")
  const [showKey, setShowKey] = React.useState(false)
  const [isSessionOnly, setIsSessionOnly] = React.useState(false)

  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const handleUnlock = () => {
    if (passphrase) {
      setIsUnlocked(true)
      setPassphrase("")
    }
  }

  const handleLock = () => {
    setIsUnlocked(false)
  }

  const handleSaveKey = () => {
    if (!editingProvider || !newKeyValue) return

    // Check if it exists
    const existing = keys.find(k => k.provider === editingProvider)
    if (existing) {
      setKeys(keys.map(k => k.provider === editingProvider ? { ...k, status: "configured", isSessionOnly } : k))
    } else {
      setKeys([...keys, { id: Math.random().toString(), provider: editingProvider, status: "configured", isSessionOnly }])
    }

    setEditingProvider(null)
    setNewKeyValue("")
    setIsSessionOnly(false)
  }

  const handleDelete = () => {
    if (deleteId) {
      setKeys(keys.filter(k => k.id !== deleteId))
      setDeleteId(null)
    }
  }

  if (!isUnlocked) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-2">
            <Lock className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Vault Locked</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Enter your passphrase to decrypt your keys. Your keys never leave this device.
          </p>
          <div className="flex w-full max-w-sm items-center space-x-2 mt-4">
            <Input
              type="password"
              placeholder="Passphrase..."
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            />
            <Button onClick={handleUnlock}>Unlock</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">API Keys</h3>
          <p className="text-sm text-muted-foreground">Manage your provider integrations.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLock}>
          <Lock className="size-4 mr-2" />
          Lock Vault
        </Button>
      </div>

      <InlineHint type="info">
        Keys are stored locally and encrypted. They are never sent to our servers.
      </InlineHint>

      {editingProvider ? (
        <SectionCard
          title={`Configure ${editingProvider}`}
          description="Enter your API key below."
        >
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2 rounded-lg border p-4">
              <Switch
                id="session-mode"
                checked={isSessionOnly}
                onCheckedChange={setIsSessionOnly}
              />
              <div className="space-y-0.5">
                <Label htmlFor="session-mode">Session-only mode</Label>
                <p className="text-sm text-muted-foreground">
                  Forget this key when the session ends.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingProvider(null)}>Cancel</Button>
              <Button onClick={handleSaveKey}>Save Key</Button>
            </div>
          </div>
        </SectionCard>
      ) : (
        <>
          {keys.length === 0 ? (
            <EmptyState
              icon={<KeyRound className="size-10" />}
              title="No Keys Configured"
              description="Add an API key to enable AI features."
            />
          ) : (
            <SectionCard title="Configured Providers" className="p-0">
              <div className="flex flex-col">
                {keys.map((key) => (
                  <SettingsRow
                    key={key.id}
                    className="px-6 border-b last:border-0"
                    icon={<Check className="size-5 text-success" />}
                    title={key.provider}
                    description={
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={key.status === "configured" ? "success" : "error"}>
                          {key.status}
                        </StatusBadge>
                        {key.isSessionOnly && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Session Only</span>}
                      </div>
                    }
                    action={
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingProvider(key.provider)
                          setNewKeyValue("hidden-key-value")
                          setIsSessionOnly(key.isSessionOnly)
                        }}>Edit</Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(key.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    }
                  />
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard title="Available Integrations" className="p-0">
            <div className="flex flex-col">
              {["OpenAI", "Google", "ElevenLabs"].filter(p => !keys.find(k => k.provider === p)).map(provider => (
                <SettingsRow
                  key={provider}
                  className="px-6 border-b last:border-0"
                  icon={<AlertCircle className="size-5 text-muted-foreground" />}
                  title={provider}
                  description="Not configured"
                  action={
                    <Button variant="secondary" size="sm" onClick={() => {
                      setEditingProvider(provider)
                      setNewKeyValue("")
                      setIsSessionOnly(false)
                    }}>
                      <Plus className="size-4 mr-1" /> Add
                    </Button>
                  }
                />
              ))}
            </div>
          </SectionCard>
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Remove API Key?"
        description="This will permanently delete the encrypted key from your device. You will need to re-enter it to use this provider."
        confirmText="Remove Key"
        destructive={true}
        onConfirm={handleDelete}
      />
    </div>
  )
}
