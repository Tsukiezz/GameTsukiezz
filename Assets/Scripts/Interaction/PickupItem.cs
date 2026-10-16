using UnityEngine;
using Tsukiezz.Inventory;

namespace Tsukiezz.Interaction
{
    /// <summary>
    /// Vật phẩm có thể nhặt được trên bản đồ phiêu lưu.
    /// Tự động thêm vào InventoryManager khi tương tác.
    /// </summary>
    public class PickupItem : InteractableBase
    {
        [Header("Item Data")]
        [SerializeField] private ItemData _itemData;
        [SerializeField] private AudioClip _pickupSound;

        public override string GetPromptText()
        {
            return _itemData != null ? $"Nhấn [E] để nhặt {_itemData.itemName}" : base.GetPromptText();
        }

        public override void Interact(GameObject interactor)
        {
            if (!CanInteract() || _itemData == null) return;

            base.Interact(interactor);

            if (InventoryManager.Instance != null)
            {
                InventoryManager.Instance.AddItem(_itemData);
            }

            if (_pickupSound != null)
            {
                AudioSource.PlayClipAtPoint(_pickupSound, transform.position);
            }

            // Ẩn hoặc hủy vật thể sau khi nhặt
            gameObject.SetActive(false);
        }
    }
}
