import { describe, expect, it } from 'vitest'
import { createMasker, maskValue } from '../masking'

describe('maskValue', () => {
  it('手机号脱敏', () => {
    const result = maskValue('13812345678', { pattern: '', type: 'phone' })
    expect(result).toBe('138****5678')
  })

  it('邮箱脱敏', () => {
    const result = maskValue('user@example.com', { pattern: '', type: 'email' })
    expect(result).toBe('u***r@example.com')
  })

  it('身份证号脱敏', () => {
    const result = maskValue('110101199001011234', { pattern: '', type: 'idcard' })
    expect(result).toBe('110***********1234')
  })

  it('银行卡号脱敏', () => {
    const result = maskValue('6222021234561234', { pattern: '', type: 'bankcard' })
    expect(result).toBe('**** **** **** 1234')
  })

  it('姓名脱敏（两个字）', () => {
    const result = maskValue('张三', { pattern: '', type: 'name' })
    expect(result).toBe('张*')
  })

  it('姓名脱敏（三个字）', () => {
    const result = maskValue('欧阳修', { pattern: '', type: 'name' })
    expect(result).toBe('欧阳**')
  })

  it('地址脱敏', () => {
    const result = maskValue('北京市朝阳区某某路1号', { pattern: '', type: 'address' })
    /* 保留前 6 个字符，后续用 * 替换 */
    expect(result.startsWith('北京市朝阳区') || result.startsWith('北京市朝阳')).toBe(true)
    expect(result).toContain('*')
  })

  it('自定义脱敏', () => {
    const result = maskValue('secret', {
      pattern: '',
      type: 'custom',
      mask: () => '***机密***',
    })
    expect(result).toBe('***机密***')
  })

  it('空值返回空字符串', () => {
    expect(maskValue(null, { pattern: '', type: 'phone' })).toBe('')
    expect(maskValue(undefined, { pattern: '', type: 'phone' })).toBe('')
    expect(maskValue('', { pattern: '', type: 'phone' })).toBe('')
  })

  it('自定义占位符', () => {
    const result = maskValue('13812345678', { pattern: '', type: 'phone', placeholder: '#' })
    expect(result).toBe('138####5678')
  })
})

describe('createMasker', () => {
  it('根据规则匹配脱敏', () => {
    const masker = createMasker({
      rules: [
        { pattern: 'phone', type: 'phone' },
        { pattern: 'email', type: 'email' },
      ],
    })

    expect(masker('phone', '13812345678')).toBe('138****5678')
    expect(masker('email', 'user@example.com')).toBe('u***r@example.com')
  })

  it('无匹配规则原样返回', () => {
    const masker = createMasker({
      rules: [{ pattern: 'phone', type: 'phone' }],
    })

    expect(masker('name', '张三')).toBe('张三')
  })

  it('通配符匹配', () => {
    const masker = createMasker({
      rules: [
        { pattern: 'contacts.*.phone', type: 'phone' },
      ],
    })

    expect(masker('contacts.0.phone', '13812345678')).toBe('138****5678')
    expect(masker('contacts.1.phone', '13998765432')).toBe('139****5432')
  })
})
