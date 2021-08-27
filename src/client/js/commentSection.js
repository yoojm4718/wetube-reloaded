const videoContainer = document.querySelector(".watch");
const form = document.getElementById("commentForm");
const deleteBtns = Array.from(document.querySelectorAll(".comment_delete"));

const addComment = (content, id) => {
  const videoComments = document.querySelector(".watch_comments ul");
  const newComment = document.createElement("li");
  newComment.className = "watch_comment";
  newComment.dataset.id = id;
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  newComment.appendChild(icon);
  const span = document.createElement("span");
  span.innerText = content;
  newComment.appendChild(span);
  const button = document.createElement("button");
  button.className = "comment_button";
  button.innerText = "❌";
  newComment.appendChild(button);
  videoComments.prepend(newComment);
  videoComments.addEventListener("click", handleDelete);
};

const handleSubmit = async (event) => {
  const textarea = form.querySelector("textarea");
  event.preventDefault();
  const content = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (content === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // we need to add headers of Content-Type to say to express that this is stringified JSON. not just a text.
    },
    body: JSON.stringify({
      // we must stringify the object(JSON)
      content,
    }),
  });
  const { newCommentId } = await response.json(); // get back-end's message in front-end *********
  if (response.status === 201) {
    addComment(content, newCommentId);
  }
  textarea.value = "";
};

const handleDelete = async (event) => {
  const { id } = event.target.parentElement.dataset;
  const videoId = videoContainer.dataset.id;
  const { status } = await fetch(`/api/videos/${videoId}/comment`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
    }),
  });
  if (status === 200) {
    event.target.parentElement.remove();
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (deleteBtns !== []) {
  deleteBtns.map((deleteBtn) => {
    deleteBtn.addEventListener("click", handleDelete);
  });
}
