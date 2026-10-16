using UnityEngine;
using Tsukiezz.Core;

namespace Tsukiezz.Player
{
    /// <summary>
    /// Điều khiển di chuyển của nhân vật chính trong game phiêu lưu Tsukiezz.
    /// Tự động khóa di chuyển khi đang đọc hội thoại hoặc trong Cutscene.
    /// </summary>
    [RequireComponent(typeof(Rigidbody2D))]
    public class PlayerController : MonoBehaviour
    {
        [Header("Movement")]
        [SerializeField] private float _moveSpeed = 5.0f;
        [SerializeField] private float _runMultiplier = 1.4f;

        private Rigidbody2D _rb2d;
        private Vector2 _moveInput;
        private Vector2 _lastFacingDirection = Vector2.down;
        private bool _canMove = true;

        public Vector2 FacingDirection => _lastFacingDirection;
        public bool IsMoving => _moveInput.sqrMagnitude > 0.01f;

        private void Awake()
        {
            _rb2d = GetComponent<Rigidbody2D>();
            _rb2d.gravityScale = 0f; // Top-down adventure không trọng lực rơi
            _rb2d.freezeRotation = true;
        }

        private void Start()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnGameStateChanged += HandleGameStateChanged;
            }
        }

        private void OnDestroy()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnGameStateChanged -= HandleGameStateChanged;
            }
        }

        private void Update()
        {
            if (!_canMove)
            {
                _moveInput = Vector2.zero;
                return;
            }

            float h = Input.GetAxisRaw("Horizontal");
            float v = Input.GetAxisRaw("Vertical");
            _moveInput = new Vector2(h, v).normalized;

            if (_moveInput.sqrMagnitude > 0.01f)
            {
                _lastFacingDirection = _moveInput;
            }
        }

        private void FixedUpdate()
        {
            if (!_canMove)
            {
                _rb2d.velocity = Vector2.zero;
                return;
            }

            float currentSpeed = _moveSpeed;
            if (Input.GetKey(KeyCode.LeftShift))
            {
                currentSpeed *= _runMultiplier;
            }

            _rb2d.velocity = _moveInput * currentSpeed;
        }

        private void HandleGameStateChanged(GameState state)
        {
            _canMove = (state == GameState.Exploring);
            if (!_canMove)
            {
                _moveInput = Vector2.zero;
                if (_rb2d != null)
                {
                    _rb2d.velocity = Vector2.zero;
                }
            }
        }

        public void SetMovementEnabled(bool enabled)
        {
            _canMove = enabled;
            if (!_canMove && _rb2d != null)
            {
                _rb2d.velocity = Vector2.zero;
            }
        }
    }
}
