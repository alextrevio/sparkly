-- Sparkli Database Schema
-- Run this in your Supabase SQL Editor

-- Organizaciones (multi-tenant)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  credits_remaining INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Miembros de organización
CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  invited_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- Proyectos / Marcas
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  brand_voice TEXT,
  brand_colors JSONB DEFAULT '{}',
  target_audience JSONB DEFAULT '{}',
  industry TEXT,
  website_url TEXT,
  social_accounts JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversaciones con agentes
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  title TEXT,
  status TEXT DEFAULT 'active',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mensajes individuales
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Outputs generados
CREATE TABLE generated_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  output_type TEXT NOT NULL,
  content JSONB NOT NULL,
  status TEXT DEFAULT 'draft',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Brand assets subidos
CREATE TABLE brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Uso y billing
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  credits_consumed INTEGER DEFAULT 0,
  conversation_id UUID REFERENCES conversations(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Templates de la plataforma
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  category TEXT,
  name TEXT NOT NULL,
  description TEXT,
  prompt_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Organizations: members can read their own orgs
CREATE POLICY "org_members_can_read_org" ON organizations
  FOR SELECT USING (
    id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- Organizations: owners can update
CREATE POLICY "org_owners_can_update" ON organizations
  FOR UPDATE USING (
    id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- Organizations: authenticated users can insert (for registration)
CREATE POLICY "authenticated_can_create_org" ON organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Org members: can read members of their orgs
CREATE POLICY "org_members_can_read_members" ON org_members
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- Org members: can insert into their own orgs
CREATE POLICY "org_members_can_insert" ON org_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Projects: org members can access
CREATE POLICY "org_members_access_projects" ON projects
  FOR ALL USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- Conversations: through project org membership
CREATE POLICY "org_members_access_conversations" ON conversations
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN org_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Messages: through conversation access
CREATE POLICY "org_members_access_messages" ON messages
  FOR ALL USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN projects p ON p.id = c.project_id
      JOIN org_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Generated outputs: through conversation access
CREATE POLICY "org_members_access_outputs" ON generated_outputs
  FOR ALL USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN projects p ON p.id = c.project_id
      JOIN org_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Brand assets: through project access
CREATE POLICY "org_members_access_brand_assets" ON brand_assets
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN org_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Usage logs: org members can read
CREATE POLICY "org_members_access_usage" ON usage_logs
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- Usage logs: insert via service role only (handled in API)
CREATE POLICY "service_role_insert_usage" ON usage_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Templates: public read
CREATE POLICY "templates_public_read" ON templates
  FOR SELECT USING (true);
