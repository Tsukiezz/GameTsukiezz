using System;
using System.Collections.Generic;
using UnityEngine;
using Tsukiezz.Core;

namespace Tsukiezz.Quests
{
    /// <summary>
    /// Quản lý danh sách nhiệm vụ cốt truyện hiện hành của Tsukiezz.
    /// </summary>
    public class QuestManager : MonoBehaviour
    {
        public static QuestManager Instance { get; private set; }

        [SerializeField] private List<QuestData> _activeQuests = new List<QuestData>();
        [SerializeField] private List<QuestData> _completedQuests = new List<QuestData>();

        public event Action<QuestData> OnQuestStarted;
        public event Action<QuestData> OnQuestUpdated;
        public event Action<QuestData> OnQuestCompleted;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        public void StartQuest(QuestData quest)
        {
            if (quest == null || _activeQuests.Contains(quest) || _completedQuests.Contains(quest)) return;

            quest.state = QuestState.InProgress;
            _activeQuests.Add(quest);
            Debug.Log($"[Quest] Bắt đầu nhiệm vụ: {quest.title}");
            OnQuestStarted?.Invoke(quest);
        }

        public void CompleteQuest(QuestData quest)
        {
            if (quest == null || !_activeQuests.Contains(quest)) return;

            quest.state = QuestState.Completed;
            _activeQuests.Remove(quest);
            _completedQuests.Add(quest);

            if (!string.IsNullOrEmpty(quest.completionStoryFlag) && GameManager.Instance != null)
            {
                GameManager.Instance.SetStoryFlag(quest.completionStoryFlag, true);
            }

            Debug.Log($"[Quest] Hoàn thành nhiệm vụ: {quest.title}");
            OnQuestCompleted?.Invoke(quest);
        }

        public bool IsQuestCompleted(string questId)
        {
            return _completedQuests.Exists(q => q.questId == questId);
        }

        public List<QuestData> GetActiveQuests() => _activeQuests;
    }
}
