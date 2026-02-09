import { describe, expect, it } from 'vitest'
import { FormACL } from '../acl'

describe('FormACL', () => {
  it('默认权限为 full', () => {
    const acl = new FormACL()
    expect(acl.getFieldPermission('name', [])).toBe('full')
  })

  it('自定义默认权限', () => {
    const acl = new FormACL({ defaultPermission: 'view' })
    expect(acl.getFieldPermission('name', [])).toBe('view')
  })

  it('直接规则匹配', () => {
    const acl = new FormACL({
      rules: [
        { pattern: 'secret', permission: 'none' },
        { pattern: 'name', permission: 'edit' },
      ],
    })
    expect(acl.getFieldPermission('secret', [])).toBe('none')
    expect(acl.getFieldPermission('name', [])).toBe('edit')
    expect(acl.getFieldPermission('other', [])).toBe('full')
  })

  it('通配符规则', () => {
    const acl = new FormACL({
      rules: [
        { pattern: '*', permission: 'view' },
        { pattern: 'admin.*', permission: 'none' },
      ],
    })
    expect(acl.getFieldPermission('name', [])).toBe('view')
  })

  it('角色权限', () => {
    const acl = new FormACL({
      defaultPermission: 'none',
      roles: [
        {
          role: 'admin',
          rules: [{ pattern: '*', permission: 'full' }],
        },
        {
          role: 'viewer',
          rules: [{ pattern: '*', permission: 'view' }],
        },
      ],
    })

    expect(acl.getFieldPermission('name', ['admin'])).toBe('full')
    expect(acl.getFieldPermission('name', ['viewer'])).toBe('view')
    expect(acl.getFieldPermission('name', [])).toBe('none')
  })

  it('多角色取最高权限', () => {
    const acl = new FormACL({
      defaultPermission: 'none',
      roles: [
        {
          role: 'editor',
          rules: [{ pattern: 'title', permission: 'edit' }],
        },
        {
          role: 'viewer',
          rules: [{ pattern: 'title', permission: 'view' }],
        },
      ],
    })

    /* editor + viewer → 取最高 = edit */
    expect(acl.getFieldPermission('title', ['editor', 'viewer'])).toBe('edit')
  })

  it('同角色内后定义的规则覆盖先定义的', () => {
    const acl = new FormACL({
      roles: [{
        role: 'user',
        rules: [
          { pattern: '*', permission: 'view' },
          { pattern: 'name', permission: 'edit' },
        ],
      }],
    })

    expect(acl.getFieldPermission('name', ['user'])).toBe('edit')
    expect(acl.getFieldPermission('email', ['user'])).toBe('view')
  })

  it('动态添加角色', () => {
    const acl = new FormACL({ defaultPermission: 'none' })
    acl.addRole({
      role: 'manager',
      rules: [{ pattern: '*', permission: 'edit' }],
    })

    expect(acl.getFieldPermission('name', ['manager'])).toBe('edit')
  })

  it('移除角色', () => {
    const acl = new FormACL({
      defaultPermission: 'none',
      roles: [{ role: 'admin', rules: [{ pattern: '*', permission: 'full' }] }],
    })

    acl.removeRole('admin')
    expect(acl.getFieldPermission('name', ['admin'])).toBe('none')
  })

  it('apply 将权限应用到字段', () => {
    const fields = new Map<string, { path: string, display: string, pattern: string, disabled: boolean, readOnly: boolean }>()
    fields.set('name', { path: 'name', display: 'visible', pattern: 'editable', disabled: false, readOnly: false })
    fields.set('secret', { path: 'secret', display: 'visible', pattern: 'editable', disabled: false, readOnly: false })

    const mockForm = {
      batch: (fn: () => void) => fn(),
      getAllFields: () => fields,
    }

    const acl = new FormACL({
      rules: [
        { pattern: 'name', permission: 'view' },
        { pattern: 'secret', permission: 'none' },
      ],
    })

    acl.apply(mockForm as any, [])

    expect(fields.get('name')!.readOnly).toBe(true)
    expect(fields.get('secret')!.display).toBe('none')
  })
})
