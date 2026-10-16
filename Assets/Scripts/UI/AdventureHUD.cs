using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using Tsukiezz.Interaction;
using Tsukiezz.Inventory;
using Tsukiezz.Quests;

namespace Tsukiezz.UI
{
    /// <summary>
    /// Hiển thị HUD giao diện phiêu lưu: gợi ý phím [E], thông báo nhặt đồ, nhiệm vụ.
    /// </summary>
    public class AdventureHUD : MonoBehaviour
    {
        [Header("Gợi ý tương tác (Interaction Prompt)")]
        [SerializeField] private GameObject _promptPanel;
        [SerializeField] private Text _promptText;

        [Header("Thông báo nhặt đồ (Notification Toast)")]
        [SerializeField] private GameObject _notificationPanel;
        [SerializeField] private Text _notificationText;
        [SerializeField] private float _notificationDuration = 3f;

        [Header("Nhiệm vụ (Quest Tracker)")]
        [SerializeField] private Text _activeQuestTitleText;

        [Header("Player Reference")]
        [SerializeField] private PlayerInteraction _playerInteraction;

        private Coroutine _notificationCoroutine;

        private void Start()
        {
            if (_promptPanel != null) _promptPanel.SetActive(false);
            if (_notificationPanel != null) _notificationPanel.SetActive(false);

            if (_playerInteraction != null)
            {
                _playerInteraction.OnInteractableFound += ShowPrompt;
                _playerInteraction.OnInteractableLost += HidePrompt;
            }

            if (InventoryManager.Instance != null)
            {
                InventoryManager.Instance.OnItemAdded += HandleItemAdded;
            }

            if (QuestManager.Instance != null)
            {
                QuestManager.Instance.OnQuestStarted += HandleQuestUpdated;
                QuestManager.Instance.OnQuestCompleted += HandleQuestCompleted;
            }
        }

        private void OnDestroy()
        {
            if (_playerInteraction != null)
            {
                _playerInteraction.OnInteractableFound -= ShowPrompt;
                _playerInteraction.OnInteractableLost -= HidePrompt;
            }

            if (InventoryManager.Instance != null)
            {
                InventoryManager.Instance.OnItemAdded -= HandleItemAdded;
            }

            if (QuestManager.Instance != null)
            {
                QuestManager.Instance.OnQuestStarted -= HandleQuestUpdated;
                QuestManager.Instance.OnQuestCompleted -= HandleQuestCompleted;
            }
        }

        private void ShowPrompt(IInteractable interactable)
        {
            if (_promptPanel != null && _promptText != null)
            {
                _promptText.text = interactable.GetPromptText();
                _promptPanel.SetActive(true);
            }
        }

        private void HidePrompt()
        {
            if (_promptPanel != null)
            {
                _promptPanel.SetActive(false);
            }
        }

        private void HandleItemAdded(ItemData item)
        {
            ShowNotification($"Đã nhận: {item.itemName}!");
        }

        public void ShowNotification(string message)
        {
            if (_notificationPanel == null || _notificationText == null) return;

            if (_notificationCoroutine != null)
            {
                StopCoroutine(_notificationCoroutine);
            }
            _notificationCoroutine = StartCoroutine(NotificationRoutine(message));
        }

        private IEnumerator NotificationRoutine(string message)
        {
            _notificationText.text = message;
            _notificationPanel.SetActive(true);
            yield return new WaitForSeconds(_notificationDuration);
            _notificationPanel.SetActive(false);
        }

        private void HandleQuestUpdated(QuestData quest)
        {
            if (_activeQuestTitleText != null)
            {
                _activeQuestTitleText.text = $"Nhiệm vụ: {quest.title}";
            }
        }

        private void HandleQuestCompleted(QuestData quest)
        {
            ShowNotification($"Hoàn thành: {quest.title}!");
            if (_activeQuestTitleText != null)
            {
                _activeQuestTitleText.text = "";
            }
        }
    }
}
