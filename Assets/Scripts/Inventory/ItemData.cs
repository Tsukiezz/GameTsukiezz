using UnityEngine;
using Tsukiezz.Core;

namespace Tsukiezz.Inventory
{
    [CreateAssetMenu(fileName = "NewItem", menuName = "Tsukiezz/Item")]
    public class ItemData : ScriptableObject
    {
        [Header("Thông tin vật phẩm")]
        public string itemId = "item_key_ancient";
        public string itemName = "Chìa Khóa Cổ Tsukiezz";
        [TextArea(2, 4)]
        public string description = "Một chiếc chìa khóa bằng đá khắc họa hình vầng trăng khuyết...";
        public Sprite icon;
        public ItemType type = ItemType.QuestItem;
        public bool isKeyItem = true;
    }
}
