const DB_NAME = 'MusicFreeDB'
const DB_VERSION = 1

let dbInstance: IDBDatabase | null = null

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      // 创建对象存储
      if (!db.objectStoreNames.contains('subscriptions')) {
        db.createObjectStore('subscriptions', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('plugins')) {
        db.createObjectStore('plugins', { keyPath: 'subscriptionId' })
      }
      if (!db.objectStoreNames.contains('pluginCode')) {
        db.createObjectStore('pluginCode', { keyPath: 'pluginId' })
      }
      if (!db.objectStoreNames.contains('userVariables')) {
        db.createObjectStore('userVariables', { keyPath: 'pluginId' })
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    }
  })
}

export async function setItem<T>(storeName: string, data: T & { id?: string; key?: string; pluginId?: string; subscriptionId?: string }): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put(data)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getItem<T>(storeName: string, key: string): Promise<T | null> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(key)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || null)
  })
}

export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || [])
  })
}

export async function deleteItem(storeName: string, key: string): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(key)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.clear()
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// 迁移localStorage数据到IndexedDB
export async function migrateFromLocalStorage(): Promise<void> {
  try {
    // 迁移订阅源
    const subsRaw = localStorage.getItem('musicfree.subscriptions')
    if (subsRaw) {
      const subs = JSON.parse(subsRaw)
      await setItem('subscriptions', { id: 'main', data: subs })
      console.log('[IndexedDB] 迁移订阅源完成')
    }
    
    // 迁移插件缓存
    const pluginsRaw = localStorage.getItem('musicfree.plugins.cache')
    if (pluginsRaw) {
      const plugins = JSON.parse(pluginsRaw)
      for (const cache of plugins) {
        await setItem('plugins', cache)
      }
      console.log('[IndexedDB] 迁移插件缓存完成')
    }
    
    // 迁移插件代码
    const codeRaw = localStorage.getItem('musicfree.plugin.code.cache')
    if (codeRaw) {
      const codes = JSON.parse(codeRaw)
      for (const [pluginId, data] of Object.entries(codes)) {
        await setItem('pluginCode', { pluginId, ...data as any })
      }
      console.log('[IndexedDB] 迁移插件代码完成')
    }
    
    // 迁移用户变量
    const varsRaw = localStorage.getItem('musicfree.userVariables')
    if (varsRaw) {
      const vars = JSON.parse(varsRaw)
      for (const [pluginId, data] of Object.entries(vars)) {
        await setItem('userVariables', { pluginId, data })
      }
      console.log('[IndexedDB] 迁移用户变量完成')
    }
  } catch (e) {
    console.error('[IndexedDB] 迁移失败:', e)
  }
}
