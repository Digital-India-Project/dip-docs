import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const EXPECTED_ECOSYSTEM_REPOS = [
  'DIPINDIA',
  'dip-api',
  'dip-sdk',
  'dip-core',
  'dip-ui',
  'dip-security',
  'dip-infrastructure',
  'dip-automation',
  'dip-status',
  'dip-docs',
];

describe('Ecosystem Integration Manifest Contract (integration/manifest.json)', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'integration/manifest.json'), 'utf8')
  );

  it('defines required metadata aligned with package.json', () => {
    assert.equal(manifest.repositoryName, 'Digital-India-Project/dip-docs');
    assert.equal(manifest.packageName, pkg.name);
    assert.equal(manifest.repositoryVersion, pkg.version);
    assert.equal(typeof manifest.runtimeRequirements?.node, 'string');
    assert.ok(Array.isArray(manifest.apiContractsConsumed));
    assert.ok(Array.isArray(manifest.knownBlockers) && manifest.knownBlockers.length > 0);
    assert.deepEqual(manifest.environmentVariables?.requiredRuntime, []);
    assert.equal(manifest.environmentVariables?.secretsRequired, false);
  });

  it('tracks all 10 Digital India Project ecosystem repositories explicitly', () => {
    for (const repo of EXPECTED_ECOSYSTEM_REPOS) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(manifest.relatedRepositoryVersions, repo),
        `Missing relatedRepositoryVersions entry for ${repo}`
      );
    }
  });
});

describe('OpenAPI 3.1.0 Contract Alignment (docs/api/openapi.json)', () => {
  const spec = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'docs/api/openapi.json'), 'utf8')
  );
  const paths = Object.keys(spec.paths || {});

  it('matches the verified dip-api /api/v1 path catalogue', () => {
    assert.equal(spec.openapi, '3.1.0');
    const requiredPaths = [
      '/health',
      '/metrics',
      '/openapi.json',
      '/services',
      '/products',
      '/applications',
      '/applications/{applicationId}/submit',
      '/applications/{applicationId}/transition',
      '/applications/{applicationId}/documents',
      '/applications/{applicationId}/documents/upload-intent',
      '/payments/orders',
      '/payments/webhooks/cashfree',
      '/webhooks/subscriptions',
      '/webhooks/deliveries',
      '/integrations/providers',
      '/sandbox/token',
    ];
    for (const p of requiredPaths) {
      assert.ok(paths.includes(p), `Missing documented dip-api path: ${p}`);
    }
  });

  it('retains ErrorEnvelope and Money schema properties matching dip-api & dip-sdk wire contracts', () => {
    const errSchema = spec.components?.schemas?.ErrorEnvelope?.properties?.error?.properties;
    assert.ok(errSchema, 'Missing ErrorEnvelope schema definition');
    assert.ok(errSchema.code, 'ErrorEnvelope must include error.code');
    assert.ok(errSchema.message, 'ErrorEnvelope must include error.message');
    assert.ok(errSchema.correlation_id, 'ErrorEnvelope must include error.correlation_id');

    const moneySchema = spec.components?.schemas?.Money?.properties;
    assert.ok(moneySchema?.amount_minor, 'Money must include integer amount_minor');
    assert.equal(moneySchema.amount_minor.type, 'integer');
    assert.ok(moneySchema?.currency, 'Money must include currency');
  });
});

describe('dip-ui Design Token & Synchronization Documentation Contracts', () => {
  it('defines light, dark, semantic, typography, and reduced-motion tokens in src/styles/dip-tokens.css', () => {
    const tokensCss = fs.readFileSync(
      path.join(ROOT, 'src/styles/dip-tokens.css'),
      'utf8'
    );
    const requiredTokens = [
      '--dip-bg-canvas:',
      '--dip-bg-surface:',
      '--dip-bg-subtle:',
      '--dip-border:',
      '--dip-text-primary:',
      '--dip-accent:',
      '--dip-accent-fg:',
      '--dip-focus-ring:',
      '--dip-font-display:',
      '--dip-font-sans:',
      '--dip-font-mono:',
    ];
    for (const token of requiredTokens) {
      assert.ok(tokensCss.includes(token), `Missing CSS token ${token}`);
    }
    assert.ok(tokensCss.includes('.dark {'), 'Missing dark-mode token overrides');
    assert.ok(
      tokensCss.includes('prefers-reduced-motion: reduce'),
      'Missing prefers-reduced-motion accessibility override'
    );
  });

  it('includes required synchronization docs and ADR records', () => {
    const requiredFiles = [
      'docs/INTEGRATION_CONTRACTS.md',
      'docs/COMPATIBILITY_MATRIX.md',
      'docs/IMPLEMENTATION_STATUS.md',
      'docs/TEST_REPORT.md',
      'docs/adr/README.md',
      'docs/adr/0001-vite-react-documentation-runtime.md',
      'docs/adr/0002-dip-ui-token-parity-without-runtime-coupling.md',
      'docs/adr/0003-dipindia-source-of-truth-and-sandbox-labeling.md',
      'docs/adr/0004-ci-contract-validation-and-manifest-sync.md',
    ];
    for (const rel of requiredFiles) {
      assert.ok(fs.existsSync(path.join(ROOT, rel)), `Missing required sync artifact: ${rel}`);
    }

    const compatDoc = fs.readFileSync(path.join(ROOT, 'docs/COMPATIBILITY_MATRIX.md'), 'utf8');
    for (const repo of EXPECTED_ECOSYSTEM_REPOS) {
      assert.ok(compatDoc.includes(repo), `Compatibility matrix must track ${repo}`);
    }
  });
});
