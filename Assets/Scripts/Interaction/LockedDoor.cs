using UnityEngine;
using Tsukiezz.Inventory;
using Tsukiezz.Core;

namespace Tsukiezz.Interaction
{
    /// <summary>
    /// Cánh cổng hoặc lối đi phong ấn trong game phiêu lưu Tsukiezz.
    /// Yêu cầu có chìa khóa hoặc cờ cốt truyện để mở.
    /// </summary>
    public class LockedDoor : InteractableBase
    {
        [Header("Door Requirements")]
        [SerializeField] private string _requiredItemId = "item_key_ancient";
        [SerializeField] private string _openStoryFlag = "door_temple_opened";
        [SerializeField] private string _lockedMessage = "Cánh cổng bị phong ấn bởi ma thuật cổ đại...";
        [SerializeField] private string _unlockSuccessMessage = "Bạn đã dùng chìa khóa để mở cổng phong ấn!";

        [Header("Door Visuals")]
        [SerializeField] private GameObject _closedVisual;
        [SerializeField] private GameObject _openedVisual;
        [SerializeField] private Collider2D _doorObstacleCollider;

        private bool _isOpened = false;

        private void Start()
        {
            if (GameManager.Instance != null && GameManager.Instance.GetStoryFlag(_openStoryFlag))
            {
                OpenDoor(immediate: true);
            }
        }

        public override string GetPromptText()
        {
            if (_isOpened) return "";
            return "Nhấn [E] để kiểm tra cánh cổng";
        }

        public override void Interact(GameObject interactor)
        {
            if (_isOpened) return;

            if (InventoryManager.Instance != null && InventoryManager.Instance.HasItem(_requiredItemId))
            {
                OpenDoor(immediate: false);
            }
            else
            {
                Debug.Log($"[Door] {_lockedMessage}");
            }
        }

        private void OpenDoor(bool immediate)
        {
            _isOpened = true;
            SetInteractable(false);

            if (_doorObstacleCollider != null)
            {
                _doorObstacleCollider.enabled = false;
            }

            if (_closedVisual != null) _closedVisual.SetActive(false);
            if (_openedVisual != null) _openedVisual.SetActive(true);

            if (GameManager.Instance != null)
            {
                GameManager.Instance.SetStoryFlag(_openStoryFlag, true);
            }

            Debug.Log($"[Door] {_unlockSuccessMessage}");
        }
    }
}
