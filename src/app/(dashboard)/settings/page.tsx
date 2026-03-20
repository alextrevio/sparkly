"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Building2, Users } from "lucide-react";

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("");
  const [orgId, setOrgId] = useState("");
  const [members, setMembers] = useState<
    { id: string; user_id: string; role: string }[]
  >([]);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: memberships } = await supabase
      .from("org_members")
      .select("org_id, organizations(id, name)")
      .eq("user_id", user.id);

    const memberRows = memberships as { org_id: string; organizations: { id: string; name: string } | null }[] | null;
    if (memberRows?.length) {
      const org = memberRows[0].organizations as { id: string; name: string };
      setOrgId(org.id);
      setOrgName(org.name);

      const { data: orgMembers } = await supabase
        .from("org_members")
        .select("id, user_id, role")
        .eq("org_id", org.id);

      if (orgMembers) setMembers(orgMembers as { id: string; user_id: string; role: string }[]);
    }
  }

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("organizations")
      .update({ name: orgName })
      .eq("id", orgId);
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu organización y equipo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organización
          </CardTitle>
          <CardDescription>Información general de tu equipo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nombre de la organización
            </label>
            <Input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Miembros del equipo
          </CardTitle>
          <CardDescription>
            {members.length} miembro{members.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="text-sm font-mono">
                  {member.user_id.slice(0, 8)}...
                </span>
                <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
