const lintStagedConfig = {
  '*.{js,jsx,ts,tsx,mjs,cjs}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,mdx,css,scss}': ['prettier --write'],
};

export default lintStagedConfig;
