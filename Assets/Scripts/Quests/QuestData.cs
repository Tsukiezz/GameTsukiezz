using System;
using System.Collections.Generic;
using UnityEngine;
using Tsukiezz.Core;

namespace Tsukiezz.Quests
{
    [Serializable]
    public class QuestObjective
    {
        public string description = "Tìm cổ vật Tsukiezz";
        public bool isCompleted = false;
        public string requiredItemId;
        public int requiredAmount = 1;
        public int currentAmount = 0;
    }

    [CreateAssetMenu(fileName = "NewQuest", menuName = "Tsukiezz/Quest")]
    public class QuestData : ScriptableObject
    {
        [Header("Thông tin nhiệm vụ")]
        public string questId = "quest_01";
        public string title = "Ký Ức Vầng Trăng";
        [TextArea(3, 5)]
        public string description = "Tìm lại mảnh vỡ Nguyệt Tinh rơi rụng trong rừng phế tích...";

        [Header("Mục tiêu")]
        public List<QuestObjective> objectives = new List<QuestObjective>();

        [Header("Trạng thái")]
        public QuestState state = QuestState.NotStarted;

        [Header("Phần thưởng & Mở khóa")]
        public string completionStoryFlag = "quest_01_done";
        public string rewardItemId;
    }
}
