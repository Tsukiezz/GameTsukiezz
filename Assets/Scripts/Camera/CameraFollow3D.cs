using UnityEngine;

namespace Tsukiezz.CameraSystem
{
    /// <summary>
    /// Camera góc nhìn thứ 3 theo dõi chú chuột chiến binh Hamster mượt mà.
    /// </summary>
    public class CameraFollow3D : MonoBehaviour
    {
        [Header("Target to Follow")]
        [SerializeField] private Transform _target;

        [Header("Camera Offset & Settings")]
        [SerializeField] private Vector3 _offset = new Vector3(0, 4.5f, -6.5f);
        [SerializeField] private float _smoothSpeed = 0.125f;
        [SerializeField] private float _lookAtHeight = 1.2f;

        private void LateUpdate()
        {
            if (_target == null)
            {
                // Tự động tìm Player nếu chưa gán
                var player = GameObject.FindWithTag("Player");
                if (player != null)
                {
                    _target = player.transform;
                }
                else
                {
                    return;
                }
            }

            Vector3 desiredPosition = _target.position + _offset;
            Vector3 smoothedPosition = Vector3.Lerp(transform.position, desiredPosition, _smoothSpeed);
            transform.position = smoothedPosition;

            Vector3 lookTarget = _target.position + Vector3.up * _lookAtHeight;
            transform.LookAt(lookTarget);
        }

        public void SetTarget(Transform newTarget)
        {
            _target = newTarget;
        }
    }
}
