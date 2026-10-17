using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace Tsukiezz.UI
{
    /// <summary>
    /// Quản lý giao diện Trang Chủ (Main Menu / Title Screen) của Game Tsukiezz:
    /// - Bắt đầu game (Start Adventure)
    /// - Chọn nhân vật: Chiến Binh Hamster / Thỏ Phù Thủy Chiến Binh
    /// - Xem Biên Niên Sử (Lore Codex)
    /// - Bảng Cài Đặt (Âm lượng, Đồ họa, Toàn màn hình)
    /// - Thoát Game
    /// </summary>
    public class MainMenuManager : MonoBehaviour
    {
        public static MainMenuManager Instance { get; private set; }

        public enum CharacterType
        {
            HamsterWarrior,
            RabbitMageWarrior
        }

        [Header("Menu Panels")]
        [SerializeField] private GameObject _mainMenuPanel;
        [SerializeField] private GameObject _characterSelectPanel;
        [SerializeField] private GameObject _loreCodexPanel;
        [SerializeField] private GameObject _settingsPanel;
        [SerializeField] private GameObject _gameplayHUD;

        [Header("Scene Transition (Optional)")]
        [SerializeField] private string _gameplaySceneName = "AdventureScene";
        [SerializeField] private bool _useSceneLoading = false;

        [Header("Character Selection Display")]
        [SerializeField] private CharacterType _selectedCharacter = CharacterType.HamsterWarrior;
        [SerializeField] private GameObject _hamsterPreviewModel;
        [SerializeField] private GameObject _rabbitPreviewModel;
        [SerializeField] private Text _characterNameText;
        [SerializeField] private Text _characterRoleText;
        [SerializeField] private Text _characterDescText;

        [Header("Audio & Settings")]
        [SerializeField] private Slider _bgmVolumeSlider;
        [SerializeField] private Slider _sfxVolumeSlider;
        [SerializeField] private Dropdown _graphicsQualityDropdown;
        [SerializeField] private Toggle _fullscreenToggle;
        [SerializeField] private AudioSource _bgmSource;
        [SerializeField] private AudioSource _sfxSource;
        [SerializeField] private AudioClip _clickSound;
        [SerializeField] private AudioClip _hoverSound;

        public CharacterType CurrentCharacter => _selectedCharacter;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void Start()
        {
            ShowMainMenu();
            SelectCharacter((int)_selectedCharacter);

            if (_fullscreenToggle != null)
            {
                _fullscreenToggle.isOn = Screen.fullScreen;
                _fullscreenToggle.onValueChanged.AddListener(SetFullscreen);
            }

            if (_bgmVolumeSlider != null)
            {
                _bgmVolumeSlider.value = _bgmSource != null ? _bgmSource.volume : 0.8f;
                _bgmVolumeSlider.onValueChanged.AddListener(SetBGMVolume);
            }

            if (_sfxVolumeSlider != null)
            {
                _sfxVolumeSlider.value = _sfxSource != null ? _sfxSource.volume : 1f;
                _sfxVolumeSlider.onValueChanged.AddListener(SetSFXVolume);
            }

            if (_graphicsQualityDropdown != null)
            {
                _graphicsQualityDropdown.value = QualitySettings.GetQualityLevel();
                _graphicsQualityDropdown.onValueChanged.AddListener(SetGraphicsQuality);
            }
        }

        public void PlayClickSound()
        {
            if (_sfxSource != null && _clickSound != null)
            {
                _sfxSource.PlayOneShot(_clickSound);
            }
        }

        public void PlayHoverSound()
        {
            if (_sfxSource != null && _hoverSound != null)
            {
                _sfxSource.PlayOneShot(_hoverSound);
            }
        }

        #region Navigation Methods

        public void ShowMainMenu()
        {
            PlayClickSound();
            CloseAllPanels();
            if (_mainMenuPanel != null) _mainMenuPanel.SetActive(true);
        }

        public void OpenCharacterSelect()
        {
            PlayClickSound();
            CloseAllPanels();
            if (_characterSelectPanel != null) _characterSelectPanel.SetActive(true);
        }

        public void OpenLoreCodex()
        {
            PlayClickSound();
            CloseAllPanels();
            if (_loreCodexPanel != null) _loreCodexPanel.SetActive(true);
        }

        public void OpenSettings()
        {
            PlayClickSound();
            CloseAllPanels();
            if (_settingsPanel != null) _settingsPanel.SetActive(true);
        }

        public void CloseAllPanels()
        {
            if (_mainMenuPanel != null) _mainMenuPanel.SetActive(false);
            if (_characterSelectPanel != null) _characterSelectPanel.SetActive(false);
            if (_loreCodexPanel != null) _loreCodexPanel.SetActive(false);
            if (_settingsPanel != null) _settingsPanel.SetActive(false);
        }

        #endregion

        #region Character Selection

        public void SelectCharacter(int characterIndex)
        {
            PlayClickSound();
            _selectedCharacter = (CharacterType)characterIndex;

            if (_selectedCharacter == CharacterType.HamsterWarrior)
            {
                if (_hamsterPreviewModel != null) _hamsterPreviewModel.SetActive(true);
                if (_rabbitPreviewModel != null) _rabbitPreviewModel.SetActive(false);

                if (_characterNameText != null) _characterNameText.text = "CHIẾN BINH HAMSTER (TSUKIEZZ)";
                if (_characterRoleText != null) _characterRoleText.text = "Hiệp Sĩ Quả Cảm - Thủ Vệ Vầng Trăng";
                if (_characterDescText != null)
                {
                    _characterDescText.text = "Trang bị giáp hiệp sĩ vàng ròng và thanh kiếm cổ ngữ. Có chỉ số phòng ngự và thể lực vượt trội, chuyên cận chiến và bảo hộ đồng đội.";
                }
            }
            else
            {
                if (_hamsterPreviewModel != null) _hamsterPreviewModel.SetActive(false);
                if (_rabbitPreviewModel != null) _rabbitPreviewModel.SetActive(true);

                if (_characterNameText != null) _characterNameText.text = "THỎ PHÙ THỦY CHIẾN BINH (LUNARIA)";
                if (_characterRoleText != null) _characterRoleText.text = "Phù Thủy Chiến Đấu Tinh Anh";
                if (_characterDescText != null)
                {
                    _characterDescText.text = "Bậc thầy phép thuật Ánh Trăng kết hợp thanh đoản kiếm rực sáng. Tốc độ di chuyển cao cùng khả năng tung chiêu thức ma thuật tầm xa áp đảo.";
                }
            }

            // Lưu lựa chọn cho Gameplay
            PlayerPrefs.SetInt("Tsukiezz_SelectedHero", (int)_selectedCharacter);
            PlayerPrefs.Save();
        }

        #endregion

        #region Game Launch & Settings

        public void StartGame()
        {
            PlayClickSound();
            if (_useSceneLoading)
            {
                SceneManager.LoadScene(_gameplaySceneName);
            }
            else
            {
                CloseAllPanels();
                if (_gameplayHUD != null) _gameplayHUD.SetActive(true);
            }
        }

        public void ReturnToHome()
        {
            PlayClickSound();
            if (_gameplayHUD != null) _gameplayHUD.SetActive(false);
            ShowMainMenu();
        }

        public void SetBGMVolume(float volume)
        {
            if (_bgmSource != null) _bgmSource.volume = volume;
            PlayerPrefs.SetFloat("BGM_Volume", volume);
        }

        public void SetSFXVolume(float volume)
        {
            if (_sfxSource != null) _sfxSource.volume = volume;
            PlayerPrefs.SetFloat("SFX_Volume", volume);
        }

        public void SetGraphicsQuality(int qualityIndex)
        {
            QualitySettings.SetQualityLevel(qualityIndex);
            PlayerPrefs.SetInt("GraphicsQuality", qualityIndex);
        }

        public void SetFullscreen(bool isFullscreen)
        {
            Screen.fullScreen = isFullscreen;
        }

        public void OpenGitHubRepo()
        {
            PlayClickSound();
            Application.OpenURL("https://github.com/Tsukiezz/GameTsukiezz");
        }

        public void QuitGame()
        {
            PlayClickSound();
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }

        #endregion
    }
}
