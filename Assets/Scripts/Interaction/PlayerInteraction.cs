using System;
using UnityEngine;
using Tsukiezz.Core;

namespace Tsukiezz.Interaction
{
    /// <summary>
    /// Gắn vào Player để dò tìm và tương tác với các vật thể trong tầm bán kính.
    /// </summary>
    public class PlayerInteraction : MonoBehaviour
    {
        [Header("Detection")]
        [SerializeField] private float _interactionRadius = 2.0f;
        [SerializeField] private LayerMask _interactableLayer = ~0;
        [SerializeField] private KeyCode _interactKey = KeyCode.E;

        public event Action<IInteractable> OnInteractableFound;
        public event Action OnInteractableLost;

        public IInteractable CurrentTarget { get; private set; }

        private void Update()
        {
            if (GameManager.Instance != null && GameManager.Instance.CurrentState != GameState.Exploring)
            {
                if (CurrentTarget != null)
                {
                    CurrentTarget = null;
                    OnInteractableLost?.Invoke();
                }
                return;
            }

            FindClosestInteractable();

            if (CurrentTarget != null && (Input.GetKeyDown(_interactKey) || Input.GetKeyDown(KeyCode.Space)))
            {
                CurrentTarget.Interact(gameObject);
            }
        }

        private void FindClosestInteractable()
        {
            Collider2D[] hitColliders2D = Physics2D.OverlapCircleAll(transform.position, _interactionRadius, _interactableLayer);
            IInteractable closest = null;
            float closestDist = float.MaxValue;

            foreach (var col in hitColliders2D)
            {
                if (col.TryGetComponent<IInteractable>(out var interactable) && interactable.CanInteract())
                {
                    float dist = Vector2.Distance(transform.position, interactable.GetTransform().position);
                    if (dist < closestDist)
                    {
                        closestDist = dist;
                        closest = interactable;
                    }
                }
            }

            // Fallback hỗ trợ cả 3D Collider nếu người chơi muốn phát triển 3D
            if (closest == null)
            {
                Collider[] hitColliders3D = Physics.OverlapSphere(transform.position, _interactionRadius, _interactableLayer);
                foreach (var col in hitColliders3D)
                {
                    if (col.TryGetComponent<IInteractable>(out var interactable) && interactable.CanInteract())
                    {
                        float dist = Vector3.Distance(transform.position, interactable.GetTransform().position);
                        if (dist < closestDist)
                        {
                            closestDist = dist;
                            closest = interactable;
                        }
                    }
                }
            }

            if (closest != CurrentTarget)
            {
                CurrentTarget = closest;
                if (CurrentTarget != null)
                {
                    OnInteractableFound?.Invoke(CurrentTarget);
                }
                else
                {
                    OnInteractableLost?.Invoke();
                }
            }
        }

        private void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(transform.position, _interactionRadius);
        }
    }
}
