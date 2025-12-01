// Minimal mocks for ComanyPageClient tests. Component composes child components
// and doesn't take props, so we provide simple placeholder exports for reuse.

export const sampleCompanyDetail = { testId: "company-detail" };
export const sampleCompanyBranchTable = { testId: "company-branch-table" };

const _mocks = { sampleCompanyDetail, sampleCompanyBranchTable };

export default _mocks;
