using UnityEngine;
using Tsukiezz.Interaction;
using Tsukiezz.Core;

namespace Tsukiezz.Dialogue
{
    /// <summary>
    /// Gắn vào NPC hoặc bia đá / biển báo để kích hoạt đoạn hội thoại.
    /// Hỗ trợ đổi câu thoại theo cờ cốt truyện (Story Flags).
    /// </summary>
    [RequireComponent(typeof(InteractableBase))]
    public class DialogueTrigger : MonoBehaviour
    {
        [Header("Hội thoại ban đầu")]
        [SerializeField] private DialogueNode _defaultDialogue;

        [Header("Hội thoại có điều kiện (Ví dụ: sau khi đã hoàn thành một sự kiện)")]
        [SerializeField] private string _conditionStoryFlag;
        [SerializeField] private DialogueNode _conditionalDialogue;

        private InteractableBase _interactable;

        private void Awake()
        {
            _interactable = GetComponent<InteractableBase>();
            _interactable.onInteracted.AddListener(OnInteract);
        }

        private void OnInteract(GameObject interactor)
        {
            TriggerDialogue();
        }

        public void TriggerDialogue()
        {
            DialogueNode nodeToPlay = _defaultDialogue;

            if (!string.IsNullOrEmpty(_conditionStoryFlag) && GameManager.Instance != null)
            {
                if (GameManager.Instance.GetStoryFlag(_conditionStoryFlag) && _conditionalDialogue != null)
                {
                    nodeToPlay = _conditionalDialogue;
                }
            }

            if (nodeToPlay != null && DialogueManager.Instance != null)
            {
                DialogueManager.Instance.StartDialogue(nodeToPlay);
            }
            else
            {
                Debug.LogWarning($"[DialogueTrigger] Không tìm thấy DialogueManager hoặc DialogueNode trên {gameObject.name}");
            }
        }
    }
}
