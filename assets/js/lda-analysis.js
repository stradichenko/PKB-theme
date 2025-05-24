/**
 * LDA Analysis Module
 * Performs topic modeling using TensorFlow.js
 */

document.addEventListener('DOMContentLoaded', async function() {
  // Check if LDA container exists
  const ldaContainer = document.getElementById('lda-chart');
  if (!ldaContainer) {
    console.log('LDA container not found, skipping LDA analysis');
    return;
  }

  try {
    // Wait for TensorFlow.js to load
    if (typeof tf === 'undefined') {
      console.error('TensorFlow.js not loaded');
      return;
    }

    await tf.setBackend('webgl');
    console.log('TensorFlow.js backend set to WebGL');
    
    // Extract content from embedded data or generate from Hugo template
    const documents = getLDADocuments();
    
    if (documents.length === 0) {
      throw new Error('No documents found for analysis');
    }

    // Initialize parameters
    const NUM_TOPICS = 8;
    const NUM_WORDS_PER_TOPIC = 10;
    const NUM_ITERATIONS = 50;
    
    // Preprocess documents
    const { docWordMatrix, vocabulary } = preprocessDocuments(documents.map(d => d.content));
    
    if (vocabulary.length === 0) {
      throw new Error('No vocabulary extracted from documents');
    }
    
    // Convert to tensor with proper shape
    const docWordTensor = tf.tensor2d(docWordMatrix);
    
    // Run LDA
    const { topicWordDist, docTopicDist } = await runLDA(
      docWordTensor,
      NUM_TOPICS,
      NUM_ITERATIONS
    );

    // Extract top words and generate topic titles
    const topicData = extractTopicWords(topicWordDist.arraySync(), vocabulary, NUM_WORDS_PER_TOPIC);
    
    // Match documents to their most probable topics
    const docTopics = docTopicDist.arraySync().map((dist, idx) => {
      const topTopicIdx = dist.indexOf(Math.max(...dist));
      return {
        title: documents[idx].title,
        type: documents[idx].type,
        topicIndex: topTopicIdx,
        probability: dist[topTopicIdx]
      };
    });

    // Update UI with document classifications
    updateTopicList(topicData, docTopics);
    createTopicDistributionChart(docTopicDist.arraySync());

    console.log('LDA analysis completed successfully');

  } catch (error) {
    console.error('LDA Analysis failed:', error);
    document.getElementById('topic-list').innerHTML = `
      <div class="lda-error">
        <p>Failed to perform LDA analysis: ${error.message}</p>
        <p>This feature requires modern browser support and may not work on all devices.</p>
      </div>
    `;
  }
});

function getLDADocuments() {
  // Try to get documents from embedded data first
  const dataElement = document.getElementById('lda-documents-data');
  if (dataElement) {
    try {
      return JSON.parse(dataElement.textContent);
    } catch (e) {
      console.warn('Failed to parse embedded LDA documents data');
    }
  }
  
  // Fallback to extracting from page content
  return extractDocumentsFromPage();
}

function extractDocumentsFromPage() {
  // This is a fallback method to extract some content from the current page
  const documents = [];
  
  // Extract content from different sections
  const contentSections = document.querySelectorAll('.post-content, .about-section, article');
  contentSections.forEach((section, index) => {
    const text = section.textContent || section.innerText;
    if (text && text.trim().length > 100) {
      documents.push({
        content: text.trim(),
        type: 'content',
        title: `Section ${index + 1}`
      });
    }
  });
  
  return documents;
}

function preprocessDocuments(documents) {
  // Define comprehensive stop words
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'among', 'this', 'that', 'these', 'those',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'must', 'can', 'of', 'as', 'if', 'when', 'where', 'why', 'how', 'what',
    'who', 'which', 'whose', 'whom', 'it', 'its', 'he', 'she', 'him', 'her',
    'his', 'hers', 'they', 'them', 'their', 'theirs', 'we', 'us', 'our',
    'ours', 'you', 'your', 'yours', 'i', 'me', 'my', 'mine'
  ]);
  
  // Create vocabulary
  const vocabMap = new Map();
  const wordCounts = new Map();
  
  // First pass: build vocabulary
  documents.forEach(doc => {
    const words = doc.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w));
      
    words.forEach(word => {
      if (!vocabMap.has(word)) {
        vocabMap.set(word, vocabMap.size);
      }
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });
  });

  // Filter vocabulary to most frequent words (but not too frequent)
  const totalWords = Array.from(wordCounts.values()).reduce((a, b) => a + b, 0);
  const sortedWords = Array.from(wordCounts.entries())
    .filter(([word, count]) => {
      const freq = count / totalWords;
      return freq > 0.001 && freq < 0.1 && count >= 2; // Filter very rare and very common words
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, 500) // Reduce vocabulary size for better performance
    .map(([word]) => word);

  const vocabulary = sortedWords;
  const vocabSize = vocabulary.length;
  
  console.log(`Vocabulary size: ${vocabSize}, Total documents: ${documents.length}`);
  
  // Create document-word matrix
  const docWordMatrix = documents.map(doc => {
    const counts = new Array(vocabSize).fill(0);
    const words = doc.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w));
      
    words.forEach(word => {
      const idx = vocabulary.indexOf(word);
      if (idx !== -1) {
        counts[idx]++;
      }
    });
    
    // Normalize to prevent documents with more words from dominating
    const total = counts.reduce((a, b) => a + b, 0);
    if (total > 0) {
      for (let i = 0; i < counts.length; i++) {
        counts[i] = counts[i] / total;
      }
    }
    
    return counts;
  });

  return { docWordMatrix, vocabulary };
}

async function runLDA(docWordTensor, numTopics, numIterations) {
  return tf.tidy(() => {
    const [numDocs, vocabSize] = docWordTensor.shape;
    
    console.log(`Running LDA with ${numDocs} docs, ${vocabSize} vocab, ${numTopics} topics`);
    
    // Initialize random distributions with Dirichlet-like initialization
    const alpha = 0.1; // Document-topic concentration
    const beta = 0.01;  // Topic-word concentration
    
    let docTopicDist = tf.randomUniform([numDocs, numTopics]).add(alpha);
    let topicWordDist = tf.randomUniform([numTopics, vocabSize]).add(beta);
    
    // Normalize initial distributions
    docTopicDist = docTopicDist.div(docTopicDist.sum(1, true));
    topicWordDist = topicWordDist.div(topicWordDist.sum(1, true));
    
    // Run Gibbs sampling-like iterations
    for (let iter = 0; iter < numIterations; iter++) {
      // E-step: Update document-topic distributions
      const topicWordTranspose = topicWordDist.transpose();
      const newDocTopic = tf.matMul(docWordTensor, topicWordTranspose).add(alpha);
      docTopicDist = newDocTopic.div(newDocTopic.sum(1, true));
      
      // M-step: Update topic-word distributions  
      const docTopicTranspose = docTopicDist.transpose();
      const newTopicWord = tf.matMul(docTopicTranspose, docWordTensor).add(beta);
      topicWordDist = newTopicWord.div(newTopicWord.sum(1, true));
      
      if (iter % 10 === 0) {
        console.log(`LDA iteration ${iter}/${numIterations}`);
      }
    }
    
    return {
      topicWordDist: topicWordDist,
      docTopicDist: docTopicDist
    };
  });
}

function extractTopicWords(topicWordDist, vocabulary, numWords) {
  return topicWordDist.map((topic, topicIdx) => {
    const wordScores = vocabulary.map((word, idx) => ({
      word: word,
      weight: topic[idx]
    }));
    
    const sortedWords = wordScores
      .sort((a, b) => b.weight - a.weight)
      .slice(0, numWords);
    
    console.log(`Topic ${topicIdx}: ${sortedWords.map(w => w.word).join(', ')}`);
    
    return sortedWords;
  });
}

function updateTopicList(topicWords, docTopics) {
  const topicList = document.getElementById('topic-list');
  if (!topicList) return;
  
  topicList.innerHTML = topicWords.map((topic, i) => {
    const docsInTopic = docTopics.filter(d => d.topicIndex === i)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);

    const pseudoTitle = generateTopicTitle(topic);
    
    return `
      <div class="topic-item">
        <div class="topic-title">
          <span class="topic-number">Topic ${i + 1}</span>
          <span class="topic-pseudo-title">"${pseudoTitle}"</span>
        </div>
        <div class="topic-content">
          <div class="topic-words">
            <table class="topic-word-table">
              <thead>
                <tr>
                  <th>Term</th>
                  <th>Weight</th>
                </tr>
              </thead>
              <tbody>
                ${topic.map(({word, weight}) => `
                  <tr>
                    <td><span class="topic-word">${word}</span></td>
                    <td><span class="topic-weight">${weight.toFixed(4)}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ${docsInTopic.length > 0 ? `
            <div class="topic-documents">
              <h4>Related Content:</h4>
              <ul>
                ${docsInTopic.map(doc => `
                  <li>
                    <span class="doc-type ${doc.type}">${doc.type}</span>
                    ${doc.title}
                    <small>(${(doc.probability * 100).toFixed(1)}%)</small>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function generateTopicTitle(topic) {
  const topWords = topic
    .slice(0, 3)
    .map(t => t.word)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1));
  
  if (topWords.length >= 2) {
    return `${topWords[0]} & ${topWords[1]}`;
  }
  
  return topWords[0] || "Unnamed Topic";
}

function createTopicDistributionChart(docTopicDist) {
  const chartContainer = document.getElementById('lda-chart');
  if (!chartContainer) return;
  
  // Check if D3 is available
  if (typeof d3 === 'undefined') {
    chartContainer.innerHTML = '<p>Chart library not available</p>';
    return;
  }

  // Clear previous chart
  d3.select('#lda-chart').html('');

  const width = Math.min(chartContainer.clientWidth, 600);
  const height = 400;
  const margin = { top: 40, right: 20, bottom: 60, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select('#lda-chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Process data for visualization
  const topicData = docTopicDist[0].map((_, topicIdx) => ({
    topic: `Topic ${topicIdx + 1}`,
    avgProb: d3.mean(docTopicDist, d => d[topicIdx]) || 0
  }));

  const xScale = d3.scaleBand()
    .domain(topicData.map(d => d.topic))
    .range([0, innerWidth])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(topicData, d => d.avgProb) || 1])
    .range([innerHeight, 0]);

  // Create bars
  g.selectAll('rect')
    .data(topicData)
    .enter()
    .append('rect')
    .attr('x', d => xScale(d.topic))
    .attr('y', d => yScale(d.avgProb))
    .attr('width', xScale.bandwidth())
    .attr('height', d => innerHeight - yScale(d.avgProb))
    .attr('fill', 'var(--color-primary)')
    .attr('rx', 4)
    .attr('ry', 4);

  // Add axes
  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');

  g.append('g')
    .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${(d * 100).toFixed(0)}%`));

  // Add labels
  svg.append('text')
    .attr('x', -height/2)
    .attr('y', 20)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text('Average Probability')
    .style('fill', 'var(--text-color-primary)');
}
