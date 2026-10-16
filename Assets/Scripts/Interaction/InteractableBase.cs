using UnityEngine;
using UnityEngine.Events;

namespace Tsukiezz.Interaction
{
    /// <summary>
    /// Component cơ sở cho mọi đối tượng có thể tương tác (NPC, hòm đồ, manh mối, cổ vật, bia đá).
    /// </summary>
    public class InteractableBase : MonoBehaviour, IInteractable
    {
        [Header("Interaction Settings")]
        [SerializeField] private string _promptText = "Nhấn [E] để tương tác";
        [SerializeField] private bool _isInteractable = true;
        [SerializeField] private bool _singleUse = false;

        [Header("Events")]
        public UnityEvent<GameObject> onInteracted;

        private bool _hasBeenInteracted = false;

        public virtual string GetPromptText()
        {
            return _promptText;
        }

        public virtual bool CanInteract()
        {
            if (_singleUse && _hasBeenInteracted) return false;
            return _isInteractable;
        }

        public virtual void Interact(GameObject interactor)
        {
            if (!CanInteract()) return;

            _hasBeenInteracted = true;
            Debug.Log($"[Interaction] Tương tác với: {gameObject.name}");
            onInteracted?.Invoke(interactor);
        }

        public Transform GetTransform()
        {
            return transform;
        }

        public void SetInteractable(bool state)
        {
            _isInteractable = state;
        }

        public void SetPromptText(string newPrompt)
        {
            _promptText = newPrompt;
        }
    }
}
