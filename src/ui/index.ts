// Unfortunately we can't compile this to a .js file and use a <script> tag
// import in the HTML file. Still keeping this around for reference, possibly
// injecting the JS with a build step.
type OnmessageType = {
  data: {
    pluginMessage: Array<
      Record<
        string,
        {
          id: string;
          payload: string;
        }
      >
    >;
  };
};

onmessage = ({ data: { pluginMessage } }: OnmessageType) => {
  const outputContainerElement = document.querySelector('.output-container')!;

  pluginMessage.forEach((entry) => {
    Object.values(entry).forEach((entry) => {
      const outputWrapperElement = document.createElement('div');
      outputWrapperElement.classList.add('output-wrapper');

      const outputElement = document.createElement('pre');
      outputElement.classList.add('output');
      outputElement.innerHTML = entry.payload;

      const buttonElement = document.createElement('button');
      buttonElement.classList.add('copy-output');
      buttonElement.innerText = 'copy';
      buttonElement.addEventListener('click', () =>
        copyToClipboard(entry.payload),
      );

      outputWrapperElement.appendChild(outputElement);
      outputWrapperElement.appendChild(buttonElement);
      outputContainerElement.appendChild(outputWrapperElement);
    });
  });
};

// navigator.clipboard is not available in the plugin so we have to fall
// back to a hack where we create a hidden text input, select its
// contents and then copy it.
function copyToClipboard(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}
