exports = module.exports = function(collectionName, itemId, options){
    console.log("collectionName", collectionName)
    console.log("itemId", itemId)
    console.log("options", options)

    // Generate a random color based on the hash
    const getRandomColor = () => {
        const colors = [
            '#e9d5ff', // Light purple
            '#bfdbfe', // Light blue 
            '#bbf7d0', // Light green
            '#fed7aa', // Light orange
            '#fecaca'  // Light red
        ];
        const hash = typeof options.toneshift === 'number' ? 
            Math.abs(options.toneshift + options.selectedEDO) : 
            Math.floor(Math.random() * colors.length);
        return colors[hash % colors.length];
    };
    const coverHTML = `
        <div class="cover-container">
            <div class="cover-header">
                <h1 class="collection-name">${collectionName}</h1>
                <h2 class="item-id">Item #${itemId}</h2>
            </div>
            <div class="cover-controls">
                <button id="playButton" class="play-button">Play</button>
            </div>
            <div class="cover-details">
                <div class="detail-item">
                    <span class="label">Instrument:</span>
                    <span class="value">${options.selectedInstrument}</span>
                </div>
                <div class="detail-item">
                    <span class="label">EDO:</span>
                    <span class="value">${options.selectedEDO}-tone</span>
                </div>
                <div class="detail-item">
                    <span class="label">Tone Shift:</span>
                    <span class="value">${options.toneshift} steps</span>
                </div>
                <div class="detail-item">
                    <span class="label">Playback Speed:</span>
                    <span class="value">x${options.playbackSpeed.toFixed(2)}</span>
                </div>
            </div>
            
        </div>
        <style>
            .cover-container {
                width: 90vw;
                max-width: 1200px;
                margin: 5vh auto;
                padding: clamp(20px, 5vw, 60px);
                background: ${getRandomColor()};
                box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                border-radius: clamp(12px, 2vw, 24px);
                display: flex;
                flex-direction: column;
                justify-content: center;
                position: fixed;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
            }
            .cover-header {
                text-align: center;
            }
            .collection-name {
                font-size: clamp(1.8rem, 4vw, 3rem);
                color: #2c3e50;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                word-wrap: break-word;
            }
            .item-id {
                font-size: clamp(1.2rem, 3vw, 1.8rem);
                color: #7f8c8d;
            }
            .cover-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: clamp(15px, 3vw, 30px);
                margin: clamp(20px, 4vw, 40px) 0;
            }
            .detail-item {
                padding: clamp(10px, 2vw, 20px);
                background: rgba(255,255,255,0.8);
                border-radius: clamp(8px, 1.5vw, 16px);
                text-align: center;
                box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                transition: transform 0.2s ease;
            }
            .detail-item:hover {
                transform: translateY(-2px);
            }
            .label {
                display: block;
                font-size: clamp(0.8rem, 1.5vw, 1rem);
                color: #95a5a6;
                margin-bottom: clamp(4px, 1vw, 8px);
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .value {
                font-size: clamp(1rem, 2vw, 1.4rem);
                color: #34495e;
                font-weight: bold;
                word-wrap: break-word;
            }
            .cover-controls {
                text-align: center;
            }
            .play-button {
                padding: clamp(10px, 2vw, 15px) clamp(20px, 4vw, 40px);
                font-size: clamp(1rem, 2vw, 1.4rem);
                background: #2c3e50;
                color: white;
                border: none;
                border-radius: clamp(6px, 1vw, 12px);
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .play-button:hover {
                background: #34495e;
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(0,0,0,0.15);
            }
            .play-button:disabled {
                background: #95a5a6;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            #Status {
                margin-top: clamp(8px, 1.5vw, 15px);
                color: #7f8c8d;
                font-size: clamp(0.9rem, 1.5vw, 1.1rem);
            }
            @media (max-width: 480px) {
                .cover-container {
                    width: 95vw;
                    margin: 2.5vh auto;
                }
                .cover-details {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    `

    window.addEventListener('load', () => {
        document.body.innerHTML += coverHTML;
    });
}