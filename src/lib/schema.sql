-- Create table for storing system settings (jsonb values)
create table if not exists system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table system_settings enable row level security;

-- Policy: Allow read access to everyone (public settings)
create policy "Allow public read access"
  on system_settings for select
  using (true);

-- Policy: Allow update only to admins (you might need to adjust this based on your auth setup)
-- For now, allowing authenticated users for demonstration, but ideally restrict to admin role
create policy "Allow admin update access"
  on system_settings for insert
  with check (auth.role() = 'authenticated') -- Replace with admin check if needed
  on conflict (key) do update set value = excluded.value;

create policy "Allow admin update access update"
    on system_settings for update
    using (auth.role() = 'authenticated'); -- Replace with admin check if needed

-- Seed initial data
insert into system_settings (key, value) values
('pricing_tiers', '{
  "basic": {
    "monthly_price": 7,
    "annual_price": 70,
    "optimizations": 150,
    "history_days": 30,
    "api_access": false,
    "support": "email"
  },
  "pro": {
    "monthly_price": 15,
    "annual_price": 150,
    "optimizations": 400,
    "history_days": 90,
    "api_access": true,
    "support": "priority"
  },
  "business": {
    "monthly_price": 35,
    "annual_price": 350,
    "optimizations": 1000,
    "history_days": 0,
    "api_access": true,
    "support": "dedicated"
  }
}'),
('founding_member', '{
  "enabled": true,
  "total_limit": 500,
  "current_count": 87,
  "applies_to": ["pro", "business"],
  "waves": [
    { "wave": 1, "spots": 100, "pro_price": 9, "business_price": 20 },
    { "wave": 2, "spots": 200, "pro_price": 11, "business_price": 25 },
    { "wave": 3, "spots": 200, "pro_price": 13, "business_price": 30 }
  ]
}'),
('annual_discount', '{
  "enabled": true,
  "percent": 17
}')
on conflict (key) do nothing;
