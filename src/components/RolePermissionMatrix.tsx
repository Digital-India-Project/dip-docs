import { useMemo, useState } from 'react';
import { Check, Minus } from 'lucide-react';

interface PermissionDef {
  code: string;
  label: string;
  group: string;
  roles: Array<'super_admin' | 'admin' | 'manager' | 'operator' | 'partner' | 'customer' | 'business'>;
}

const ROLES: Array<{ key: PermissionDef['roles'][number]; label: string }> = [
  { key: 'super_admin', label: 'Super Admin' },
  { key: 'admin', label: 'Admin' },
  { key: 'manager', label: 'Manager' },
  { key: 'operator', label: 'Operator' },
  { key: 'partner', label: 'Partner' },
  { key: 'customer', label: 'Customer' },
  { key: 'business', label: 'Business' },
];

const VERIFIED_PERMISSIONS: PermissionDef[] = [
  { code: 'applications.view', label: 'View Applications', group: 'Applications', roles: ['super_admin', 'admin', 'manager', 'operator', 'partner', 'customer', 'business'] },
  { code: 'applications.create', label: 'Create / Assisted File Applications', group: 'Applications', roles: ['super_admin', 'admin', 'manager', 'operator', 'partner', 'customer', 'business'] },
  { code: 'applications.assign', label: 'Assign & Reassign Operators', group: 'Applications', roles: ['super_admin', 'admin', 'manager'] },
  { code: 'applications.process', label: 'Process & Advance Workflow Status', group: 'Applications', roles: ['super_admin', 'admin', 'manager', 'operator'] },
  { code: 'applications.verify_documents', label: 'Verify / Reject Documents', group: 'Applications', roles: ['super_admin', 'admin', 'manager', 'operator'] },
  { code: 'applications.request_correction', label: 'Request Document Corrections', group: 'Applications', roles: ['super_admin', 'admin', 'manager', 'operator', 'partner', 'customer'] },
  { code: 'applications.complete', label: 'Complete & Upload Deliverables', group: 'Applications', roles: ['super_admin', 'admin', 'manager', 'operator'] },
  { code: 'applications.cancel', label: 'Cancel Applications', group: 'Applications', roles: ['super_admin', 'admin'] },
  { code: 'services.create', label: 'Create Dynamic Services', group: 'Services & Forms', roles: ['super_admin', 'admin'] },
  { code: 'services.edit', label: 'Edit Services & Form Versions', group: 'Services & Forms', roles: ['super_admin', 'admin'] },
  { code: 'services.publish', label: 'Publish / Unpublish Services', group: 'Services & Forms', roles: ['super_admin', 'admin'] },
  { code: 'users.manage', label: 'Manage Users & Profiles', group: 'Governance', roles: ['super_admin', 'admin'] },
  { code: 'operators.assign', label: 'Manage Operators & KYC Reviews', group: 'Governance', roles: ['super_admin', 'admin', 'manager'] },
  { code: 'partners.manage', label: 'Approve & Monitor Partners', group: 'Partners', roles: ['super_admin', 'admin', 'manager'] },
  { code: 'commissions.manage', label: 'Manage Commissions & Settlements', group: 'Finance', roles: ['super_admin', 'admin'] },
  { code: 'payments.view', label: 'View Payments & Invoices', group: 'Finance', roles: ['super_admin', 'admin', 'manager', 'operator', 'partner', 'customer', 'business'] },
  { code: 'payments.refund', label: 'Process Refunds', group: 'Finance', roles: ['super_admin', 'admin'] },
  { code: 'reports.view', label: 'View Operational & Revenue Reports', group: 'Analytics', roles: ['super_admin', 'admin', 'manager', 'partner', 'business'] },
  { code: 'settings.manage', label: 'Manage Global Business & GST Settings', group: 'Administration', roles: ['super_admin', 'admin'] },
  { code: 'audit_logs.view', label: 'View Security Audit Logs', group: 'Administration', roles: ['super_admin', 'admin'] },
  { code: 'rbac.manage', label: 'Configure Role Permissions', group: 'Administration', roles: ['super_admin', 'admin'] },
  { code: 'integrations.manage', label: 'Configure Cashfree, DigiLocker & Messaging', group: 'Administration', roles: ['super_admin', 'admin'] },
];

export function RolePermissionMatrix() {
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const groups = useMemo(
    () => ['All', ...Array.from(new Set(VERIFIED_PERMISSIONS.map((p) => p.group)))],
    []
  );

  const visiblePermissions = useMemo(
    () =>
      selectedGroup === 'All'
        ? VERIFIED_PERMISSIONS
        : VERIFIED_PERMISSIONS.filter((p) => p.group === selectedGroup),
    [selectedGroup]
  );

  return (
    <section aria-label="Interactive RBAC Permission Matrix" className="my-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--dip-radius-md)] border border-[var(--dip-border)] bg-[var(--dip-bg-subtle)] p-4">
        <div>
          <h2 className="font-semibold text-lg text-[var(--dip-text-primary)]">
            Interactive Permission Matrix (DIPINDIA)
          </h2>
          <p className="mt-1 text-xs text-[var(--dip-text-muted)]">
            Source: <span className="font-mono">src/lib/rbac.ts</span> ·{' '}
            <span className="dip-tabular">{visiblePermissions.length}</span> of 22 permissions shown
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {groups.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setSelectedGroup(group)}
              className={`rounded-[var(--dip-radius-md)] border px-2.5 py-1 text-xs font-medium transition-colors duration-[var(--dip-duration-fast)] whitespace-nowrap shrink-0 cursor-pointer ${
                selectedGroup === group
                  ? 'border-transparent bg-[var(--dip-accent)] text-[var(--dip-accent-fg)] shadow-[var(--dip-shadow-sm)]'
                  : 'border-[var(--dip-border)] bg-[var(--dip-bg-surface)] text-[var(--dip-text-secondary)] hover:border-[var(--dip-border-strong)] hover:bg-[var(--dip-bg-subtle)]'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-[var(--dip-radius-md)] border border-[var(--dip-border)]">
        <table className="w-full border-collapse text-left text-xs dip-tabular">
          <thead className="border-b border-[var(--dip-border)] bg-[var(--dip-bg-subtle)] text-[var(--dip-text-secondary)]">
            <tr>
              <th className="px-3 py-3 font-semibold text-[var(--dip-text-primary)]">
                Permission Code
              </th>
              {ROLES.map((r) => (
                <th
                  key={r.key}
                  className="px-2.5 py-3 text-center font-semibold text-[var(--dip-text-primary)] whitespace-nowrap"
                >
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--dip-border)] bg-[var(--dip-bg-surface)]">
            {visiblePermissions.map((perm) => (
              <tr
                key={perm.code}
                className="transition-colors hover:bg-[var(--dip-bg-subtle)]/60"
              >
                <td className="px-3 py-2.5">
                  <div className="font-mono font-medium text-[var(--dip-text-primary)]">
                    {perm.code}
                  </div>
                  <div className="text-[11px] text-[var(--dip-text-muted)]">
                    {perm.label}
                  </div>
                </td>
                {ROLES.map((role) => {
                  const granted = perm.roles.includes(role.key);
                  return (
                    <td key={role.key} className="px-2.5 py-2.5 text-center">
                      {granted ? (
                        <span
                          className="inline-flex items-center justify-center text-[var(--dip-success)]"
                          title="Granted"
                        >
                          <Check className="h-4 w-4" aria-label="Granted" />
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center justify-center text-[var(--dip-border-strong)]"
                          title="Not granted"
                        >
                          <Minus className="h-3.5 w-3.5" aria-label="Not granted" />
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
