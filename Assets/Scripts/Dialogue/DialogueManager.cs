using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Tsukiezz.Core;

namespace Tsukiezz.Dialogue
{
    /// <summary>
    /// Quản lý hiển thị toàn bộ hội thoại và các lựa chọn rẽ nhánh cốt truyện.
    /// Có hiệu ứng Typewriter (gõ chữ từng ký tự).
    /// </summary>
    public class DialogueManager : MonoBehaviour
    {
        public static DialogueManager Instance { get; private set; }

        [Header("UI References")]
        [SerializeField] private GameObject _dialoguePanel;
        [SerializeField] private Text _speakerNameText;
        [SerializeField] private Text _sentenceText;
        [SerializeField] private Image _portraitImage;
        [SerializeField] private Transform _choicesContainer;
        [SerializeField] private GameObject _choiceButtonPrefab;

        [Header("Settings")]
        [SerializeField] private float _typingSpeed = 0.035f;
        [SerializeField] private AudioSource _audioSource;

        private Queue<DialogueLine> _linesQueue = new Queue<DialogueLine>();
        private DialogueNode _currentNode;
        private Coroutine _typewriterCoroutine;
        private bool _isTyping = false;
        private string _currentSentence = "";

        public event Action OnDialogueStarted;
        public event Action OnDialogueEnded;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            if (_dialoguePanel != null)
            {
                _dialoguePanel.SetActive(false);
            }
        }

        private void Update()
        {
            if (GameManager.Instance != null && GameManager.Instance.CurrentState == GameState.Dialogue)
            {
                // Nhấn Space hoặc Click chuột để tiến tới câu tiếp theo hoặc skip gõ chữ
                if (Input.GetKeyDown(KeyCode.Space) || Input.GetMouseButtonDown(0))
                {
                    OnPlayerAdvanceInput();
                }
            }
        }

        public void StartDialogue(DialogueNode node)
        {
            if (node == null || node.lines.Count == 0) return;

            _currentNode = node;
            _linesQueue.Clear();

            foreach (var line in node.lines)
            {
                _linesQueue.Enqueue(line);
            }

            if (GameManager.Instance != null)
            {
                GameManager.Instance.SetState(GameState.Dialogue);
            }

            if (_dialoguePanel != null)
            {
                _dialoguePanel.SetActive(true);
            }

            ClearChoices();
            OnDialogueStarted?.Invoke();
            DisplayNextLine();
        }

        public void OnPlayerAdvanceInput()
        {
            // Nếu còn đang trong quá trình hiện lựa chọn, không nhấn tiếp câu thoại
            if (_choicesContainer != null && _choicesContainer.childCount > 0)
            {
                return;
            }

            if (_isTyping)
            {
                // Skip typewriter và hiển thị toàn bộ câu ngay lập tức
                StopCoroutine(_typewriterCoroutine);
                _sentenceText.text = _currentSentence;
                _isTyping = false;
            }
            else
            {
                DisplayNextLine();
            }
        }

        public void DisplayNextLine()
        {
            if (_linesQueue.Count == 0)
            {
                HandleNodeEnd();
                return;
            }

            DialogueLine currentLine = _linesQueue.Dequeue();

            if (_speakerNameText != null)
            {
                _speakerNameText.text = currentLine.speakerName;
            }

            if (_portraitImage != null)
            {
                if (currentLine.speakerPortrait != null)
                {
                    _portraitImage.gameObject.SetActive(true);
                    _portraitImage.sprite = currentLine.speakerPortrait;
                }
                else
                {
                    _portraitImage.gameObject.SetActive(false);
                }
            }

            if (_audioSource != null && currentLine.voiceClip != null)
            {
                _audioSource.PlayOneShot(currentLine.voiceClip);
            }

            _currentSentence = currentLine.sentence;
            if (_typewriterCoroutine != null)
            {
                StopCoroutine(_typewriterCoroutine);
            }
            _typewriterCoroutine = StartCoroutine(TypeSentence(_currentSentence));
        }

        private IEnumerator TypeSentence(string sentence)
        {
            _isTyping = true;
            _sentenceText.text = "";

            foreach (char letter in sentence.ToCharArray())
            {
                _sentenceText.text += letter;
                yield return new WaitForSeconds(_typingSpeed);
            }

            _isTyping = false;
        }

        private void HandleNodeEnd()
        {
            // Kiểm tra xem Node có lựa chọn không
            if (_currentNode != null && _currentNode.choices != null && _currentNode.choices.Count > 0)
            {
                ShowChoices(_currentNode.choices);
                return;
            }

            // Kiểm tra node tiếp theo
            if (_currentNode != null && _currentNode.nextNode != null)
            {
                StartDialogue(_currentNode.nextNode);
                return;
            }

            EndDialogue();
        }

        private void ShowChoices(List<DialogueChoice> choices)
        {
            ClearChoices();

            if (_choicesContainer == null || _choiceButtonPrefab == null)
            {
                EndDialogue();
                return;
            }

            foreach (var choice in choices)
            {
                GameObject btnObj = Instantiate(_choiceButtonPrefab, _choicesContainer);
                Text btnText = btnObj.GetComponentInChildren<Text>();
                if (btnText != null)
                {
                    btnText.text = choice.choiceText;
                }

                Button btn = btnObj.GetComponent<Button>();
                if (btn != null)
                {
                    btn.onClick.AddListener(() => OnChoiceSelected(choice));
                }
            }
        }

        private void OnChoiceSelected(DialogueChoice choice)
        {
            ClearChoices();

            if (!string.IsNullOrEmpty(choice.setStoryFlag) && GameManager.Instance != null)
            {
                GameManager.Instance.SetStoryFlag(choice.setStoryFlag, true);
            }

            // Nếu choice chuyển sang một node khác (tìm theo nodeId nếu có cơ chế tìm, hoặc kết thúc)
            EndDialogue();
        }

        private void ClearChoices()
        {
            if (_choicesContainer == null) return;
            foreach (Transform child in _choicesContainer)
            {
                Destroy(child.gameObject);
            }
        }

        public void EndDialogue()
        {
            if (_typewriterCoroutine != null)
            {
                StopCoroutine(_typewriterCoroutine);
            }

            if (_currentNode != null && !string.IsNullOrEmpty(_currentNode.completionStoryFlag) && GameManager.Instance != null)
            {
                GameManager.Instance.SetStoryFlag(_currentNode.completionStoryFlag, true);
            }

            if (_dialoguePanel != null)
            {
                _dialoguePanel.SetActive(false);
            }

            if (GameManager.Instance != null)
            {
                GameManager.Instance.SetState(GameState.Exploring);
            }

            OnDialogueEnded?.Invoke();
            _currentNode = null;
        }
    }
}
