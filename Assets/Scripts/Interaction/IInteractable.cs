using UnityEngine;

namespace Tsukiezz.Interaction
{
    public interface IInteractable
    {
        string GetPromptText();
        void Interact(GameObject interactor);
        bool CanInteract();
        Transform GetTransform();
    }
}
