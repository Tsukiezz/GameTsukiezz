using System;
using System.Collections.Generic;
using UnityEngine;

namespace Tsukiezz.Core
{
    /// <summary>
    /// Quản lý trạng thái chính của trò chơi phiêu lưu cốt truyện Tsukiezz.
    /// Singleton tồn tại xuyên suốt mọi Scene.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Game State")]
        [SerializeField] private GameState _currentState = GameState.Exploring;
        public GameState CurrentState => _currentState;

        public event Action<GameState> OnGameStateChanged;

        [Header("Story Progression Flags")]
        private readonly Dictionary<string, bool> _storyFlags = new Dictionary<string, bool>();
        private readonly Dictionary<string, int> _storyVariables = new Dictionary<string, int>();

        public event Action<string, bool> OnStoryFlagChanged;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public void SetState(GameState newState)
        {
            if (_currentState == newState) return;

            _currentState = newState;
            Debug.Log($"[GameManager] Chuyển trạng thái sang: {newState}");
            OnGameStateChanged?.Invoke(_currentState);

            // Điều chỉnh time scale nếu cần
            Time.timeScale = (_currentState == GameState.Paused) ? 0f : 1f;
        }

        #region Story Flags & Variables
        public void SetStoryFlag(string flagName, bool value = true)
        {
            _storyFlags[flagName] = value;
            Debug.Log($"[Story] Cờ cốt truyện '{flagName}' = {value}");
            OnStoryFlagChanged?.Invoke(flagName, value);
        }

        public bool GetStoryFlag(string flagName)
        {
            return _storyFlags.TryGetValue(flagName, out bool val) && val;
        }

        public void SetStoryVariable(string varName, int value)
        {
            _storyVariables[varName] = value;
        }

        public int GetStoryVariable(string varName, int defaultValue = 0)
        {
            return _storyVariables.TryGetValue(varName, out int val) ? val : defaultValue;
        }
        #endregion

        public void PauseGame()
        {
            if (_currentState != GameState.Paused)
            {
                SetState(GameState.Paused);
            }
        }

        public void ResumeGame()
        {
            if (_currentState == GameState.Paused)
            {
                SetState(GameState.Exploring);
            }
        }
    }
}
