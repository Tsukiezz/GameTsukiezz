using System;
using System.Collections.Generic;
using UnityEngine;

namespace Tsukiezz.Inventory
{
    /// <summary>
    /// Quản lý túi đồ, vật phẩm thu thập, manh mối và chìa khóa câu đố.
    /// </summary>
    public class InventoryManager : MonoBehaviour
    {
        public static InventoryManager Instance { get; private set; }

        [SerializeField] private List<ItemData> _items = new List<ItemData>();

        public event Action<ItemData> OnItemAdded;
        public event Action<ItemData> OnItemRemoved;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        public void AddItem(ItemData item)
        {
            if (item == null) return;
            _items.Add(item);
            Debug.Log($"[Inventory] Thu thập: {item.itemName}");
            OnItemAdded?.Invoke(item);
        }

        public bool RemoveItem(ItemData item)
        {
            if (_items.Remove(item))
            {
                Debug.Log($"[Inventory] Sử dụng/Loại bỏ: {item.itemName}");
                OnItemRemoved?.Invoke(item);
                return true;
            }
            return false;
        }

        public bool HasItem(string itemId)
        {
            return _items.Exists(i => i.itemId == itemId);
        }

        public List<ItemData> GetAllItems() => _items;
    }
}
