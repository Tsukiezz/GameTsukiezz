namespace Tsukiezz.Core
{
    public enum GameState
    {
        Exploring,
        Dialogue,
        Inventory,
        Cutscene,
        Paused
    }

    public enum QuestState
    {
        NotStarted,
        InProgress,
        Completed,
        Failed
    }

    public enum ItemType
    {
        QuestItem,
        CollectibleNote,
        Artifact,
        Key,
        Consumable
    }
}
