document.addEventListener('DOMContentLoaded', () => {
    const storyList = document.getElementById('storyList');
    const newStoryBtn = document.getElementById('newStoryBtn');
    const storyTitle = document.getElementById('storyTitle');
    const chapters = document.getElementById('chapters');
    const addChapterBtn = document.getElementById('addChapterBtn');
    const saveStoryBtn = document.getElementById('saveStoryBtn');
    const storyReader = document.getElementById('storyReader');
    const readerContent = document.getElementById('readerContent');
    const closeReader = document.getElementById('closeReader');

    let currentStory = null;

    function createChapter() {
        const chapter = document.createElement('div');
        chapter.className = 'chapter';
        chapter.innerHTML = `
            <input type="text" class="chapter-title large-input" placeholder="Título del capítulo">
            <textarea class="chapter-content" placeholder="Escribe tu capítulo aquí..."></textarea>
            <button class="add-image-btn btn">Añadir Imagen</button>
        `;
        chapters.appendChild(chapter);

        chapter.querySelector('.add-image-btn').addEventListener('click', () => addImage(chapter));
    }

    function addImage(chapter) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = event => {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.style.maxWidth = '100%';
                const imgContainer = document.createElement('div');
                imgContainer.className = 'image-placeholder';
                imgContainer.appendChild(img);
                chapter.insertBefore(imgContainer, chapter.querySelector('.add-image-btn'));
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    function saveStory() {
        const title = storyTitle.value;
        const chapterElements = chapters.querySelectorAll('.chapter');
        const chapterData = Array.from(chapterElements).map(chapterEl => ({
            title: chapterEl.querySelector('.chapter-title').value,
            content: chapterEl.querySelector('.chapter-content').value,
            images: Array.from(chapterEl.querySelectorAll('img')).map(img => img.src)
        }));

        const story = { title, chapters: chapterData };
        let stories = JSON.parse(localStorage.getItem('stories') || '[]');
        if (currentStory) {
            stories = stories.map(s => s.title === currentStory ? story : s);
        } else {
            stories.push(story);
        }
        localStorage.setItem('stories', JSON.stringify(stories));
        updateStoryList();
        alert('Historia guardada con éxito!');
    }

    function updateStoryList() {
        const stories = JSON.parse(localStorage.getItem('stories') || '[]');
        storyList.innerHTML = '';
        stories.forEach(story => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="story-title">${story.title}</span>
                <button class="delete-btn">Borrar</button>
            `;
            li.querySelector('.story-title').addEventListener('click', () => openStoryReader(story));
            li.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteStory(story.title);
            });
            storyList.appendChild(li);
        });
    }

    function deleteStory(title) {
        if (confirm(`¿Estás seguro de que quieres borrar la historia "${title}"?`)) {
            let stories = JSON.parse(localStorage.getItem('stories') || '[]');
            stories = stories.filter(s => s.title !== title);
            localStorage.setItem('stories', JSON.stringify(stories));
            updateStoryList();
        }
    }

    function loadStory(story) {
        currentStory = story.title;
        storyTitle.value = story.title;
        chapters.innerHTML = '';
        story.chapters.forEach(chapter => {
            const chapterEl = document.createElement('div');
            chapterEl.className = 'chapter';
            chapterEl.innerHTML = `
                <input type="text" class="chapter-title large-input" value="${chapter.title}">
                <textarea class="chapter-content">${chapter.content}</textarea>
                <button class="add-image-btn btn">Añadir Imagen</button>
            `;
            chapter.images.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.style.maxWidth = '100%';
                const imgContainer = document.createElement('div');
                imgContainer.className = 'image-placeholder';
                imgContainer.appendChild(img);
                chapterEl.insertBefore(imgContainer, chapterEl.querySelector('.add-image-btn'));
            });
            chapters.appendChild(chapterEl);
            chapterEl.querySelector('.add-image-btn').addEventListener('click', () => addImage(chapterEl));
        });
    }

    function openStoryReader(story) {
        readerContent.innerHTML = `
            <h2>${escapeHtml(story.title)}</h2>
            ${story.chapters.map(chapter => `
                <div class="chapter">
                    <h3 class="chapter-title">${escapeHtml(chapter.title)}</h3>
                    <div class="chapter-content">${escapeHtml(chapter.content).replace(/\n/g, '<br>')}</div>
                    ${chapter.images.map(imgSrc => `<img src="${imgSrc}" alt="Imagen del capítulo">`).join('')}
                </div>
            `).join('')}
        `;
        storyReader.style.display = 'block';
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    newStoryBtn.addEventListener('click', () => {
        currentStory = null;
        storyTitle.value = '';
        chapters.innerHTML = '';
        createChapter();
    });

    addChapterBtn.addEventListener('click', createChapter);
    saveStoryBtn.addEventListener('click', saveStory);
    closeReader.addEventListener('click', () => {
        storyReader.style.display = 'none';
    });

    updateStoryList();
    createChapter();
});