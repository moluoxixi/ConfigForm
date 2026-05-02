import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['**/dist'],
  rules: {
    'ts/ban-ts-comment': [
      'error',
      {
        'ts-check': false,
        'ts-expect-error': true,
        'ts-ignore': true,
        'ts-nocheck': true,
      },
    ],
  },
})
