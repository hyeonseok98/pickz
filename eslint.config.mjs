import pluginQuery from '@tanstack/eslint-plugin-query';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  // Next.js + React + React Hooks + Core Web Vitals 규칙 적용
  ...nextVitals,

  // TypeScript 프로젝트용 추가 규칙 적용
  ...nextTs,

  // TanStack Query 사용 시 흔한 실수와 안티패턴 방지
  ...pluginQuery.configs['flat/recommended'],

  // Prettier와 충돌하는 ESLint 스타일 규칙 비활성화
  prettier,

  // Next.js 기본 ignore를 유지하면서 public 폴더까지 lint 대상에서 제외
  globalIgnores([
    // eslint-config-next 기본 ignore
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',

    // 정적 에셋 폴더: lint 대상에서 제외
    'public/**',
  ]),
]);

export default eslintConfig;
