using UnityEngine;
using Tsukiezz.Core;
using Tsukiezz.Interaction;

namespace Tsukiezz.Player
{
    /// <summary>
    /// Điều khiển di chuyển 3D của chú chuột Hamster Chiến Binh trong game Tsukiezz.
    /// Hỗ trợ xoay mượt mà theo hướng di chuyển, chạy nhanh (Shift), nhảy (Space) và tương tác [E].
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController3D : MonoBehaviour
    {
        [Header("Movement Settings")]
        [SerializeField] private float _walkSpeed = 4.5f;
        [SerializeField] private float _runSpeed = 7.5f;
        [SerializeField] private float _rotationSpeed = 12.0f;
        [SerializeField] private float _jumpHeight = 1.8f;
        [SerializeField] private float _gravity = -18.0f;

        [Header("Ground Check")]
        [SerializeField] private Transform _groundCheck;
        [SerializeField] private float _groundDistance = 0.25f;
        [SerializeField] private LayerMask _groundMask = ~0;

        private CharacterController _controller;
        private Vector3 _velocity;
        private bool _isGrounded;
        private bool _canMove = true;

        public bool IsMoving { get; private set; }
        public float CurrentSpeed { get; private set; }

        private void Awake()
        {
            _controller = GetComponent<CharacterController>();
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
                IsMoving = false;
                CurrentSpeed = 0f;
                return;
            }

            // Ground Check
            _isGrounded = _controller.isGrounded;
            if (_isGrounded && _velocity.y < 0)
            {
                _velocity.y = -2f;
            }

            // Input Di Chuyển
            float horizontal = Input.GetAxisRaw("Horizontal");
            float vertical = Input.GetAxisRaw("Vertical");
            Vector3 direction = new Vector3(horizontal, 0f, vertical).normalized;

            if (direction.magnitude >= 0.1f)
            {
                // Xoay nhân vật theo hướng di chuyển
                float targetAngle = Mathf.Atan2(direction.x, direction.z) * Mathf.Rad2Deg;
                transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.Euler(0f, targetAngle, 0f), _rotationSpeed * Time.deltaTime);

                // Tính tốc độ (Đi bộ hoặc Chạy)
                bool isRunning = Input.GetKey(KeyCode.LeftShift);
                CurrentSpeed = isRunning ? _runSpeed : _walkSpeed;
                IsMoving = true;

                Vector3 moveDir = Quaternion.Euler(0f, targetAngle, 0f) * Vector3.forward;
                _controller.Move(moveDir.normalized * CurrentSpeed * Time.deltaTime);
            }
            else
            {
                IsMoving = false;
                CurrentSpeed = 0f;
            }

            // Nhảy
            if (Input.GetButtonDown("Jump") && _isGrounded)
            {
                _velocity.y = Mathf.Sqrt(_jumpHeight * -2f * _gravity);
            }

            // Trọng lực
            _velocity.y += _gravity * Time.deltaTime;
            _controller.Move(_velocity * Time.deltaTime);
        }

        private void HandleGameStateChanged(GameState state)
        {
            _canMove = (state == GameState.Exploring);
            if (!_canMove)
            {
                IsMoving = false;
                CurrentSpeed = 0f;
            }
        }

        public void SetMovementEnabled(bool enabled)
        {
            _canMove = enabled;
        }
    }
}
