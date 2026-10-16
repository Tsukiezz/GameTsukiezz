using System;
using System.Collections.Generic;
using UnityEngine;

namespace Tsukiezz.Dialogue
{
    [Serializable]
    public class DialogueChoice
    {
        [TextArea(1, 2)]
        public string choiceText = "Trả lời...";
        public string nextNodeId = "";
        [Header("Tác động cốt truyện")]
        public string setStoryFlag = "";
        public string triggerQuestId = "";
    }

    [Serializable]
    public class DialogueLine
    {
        public string speakerName = "Tsukie";
        public Sprite speakerPortrait;
        [TextArea(2, 4)]
        public string sentence = "...";
        public AudioClip voiceClip;
    }

    [CreateAssetMenu(fileName = "NewDialogueNode", menuName = "Tsukiezz/Dialogue Node")]
    public class DialogueNode : ScriptableObject
    {
        [Header("Định danh")]
        public string nodeId = "node_01";

        [Header("Nội dung hội thoại")]
        public List<DialogueLine> lines = new List<DialogueLine>();

        [Header("Lựa chọn phân nhánh (Để trống nếu chỉ là đối thoại thẳng)")]
        public List<DialogueChoice> choices = new List<DialogueChoice>();

        [Header("Chuyển tiếp tự động sau câu thoại cuối (nếu không có Choices)")]
        public DialogueNode nextNode;

        [Header("Tác động khi kết thúc Node")]
        public string completionStoryFlag;
        public string unlockQuestId;
    }
}
