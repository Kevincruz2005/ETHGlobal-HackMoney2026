// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VideoRegistry
 * @notice Stores video metadata on-chain for NitroGate platform
 * @dev Videos are linked to creator wallet addresses
 */
contract VideoRegistry {
    struct Video {
        string ipfsHash;      // IPFS hash of the video
        string title;         // Video title
        string description;   // Video description
        string category;      // Video category
        uint256 price;        // Price in wei (price per minute)
        address creator;      // Creator's wallet address
        uint256 timestamp;    // Upload timestamp
        bool isPublished;     // Published status
    }

    // Mapping: creator address => array of video IDs
    mapping(address => uint256[]) public creatorVideos;
    
    // Mapping: video ID => Video data
    mapping(uint256 => Video) public videos;
    
    // Counter for video IDs
    uint256 public videoCount;

    // Events
    event VideoPublished(
        uint256 indexed videoId,
        address indexed creator,
        string ipfsHash,
        string title
    );

    event VideoUnpublished(uint256 indexed videoId);

    /**
     * @notice Publish a new video on-chain
     * @param _ipfsHash IPFS hash of the video
     * @param _title Video title
     * @param _description Video description
     * @param _category Video category
     * @param _price Price per minute in wei
     */
    function publishVideo(
        string memory _ipfsHash,
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _price
    ) external returns (uint256) {
        videoCount++;
        uint256 videoId = videoCount;

        videos[videoId] = Video({
            ipfsHash: _ipfsHash,
            title: _title,
            description: _description,
            category: _category,
            price: _price,
            creator: msg.sender,
            timestamp: block.timestamp,
            isPublished: true
        });

        creatorVideos[msg.sender].push(videoId);

        emit VideoPublished(videoId, msg.sender, _ipfsHash, _title);

        return videoId;
    }

    /**
     * @notice Unpublish a video (only creator can unpublish)
     * @param _videoId ID of the video to unpublish
     */
    function unpublishVideo(uint256 _videoId) external {
        require(videos[_videoId].creator == msg.sender, "Not the creator");
        require(videos[_videoId].isPublished, "Already unpublished");

        videos[_videoId].isPublished = false;

        emit VideoUnpublished(_videoId);
    }

    /**
     * @notice Get all video IDs for a creator
     * @param _creator Address of the creator
     * @return Array of video IDs
     */
    function getCreatorVideos(address _creator) external view returns (uint256[] memory) {
        return creatorVideos[_creator];
    }

    /**
     * @notice Get video details by ID
     * @param _videoId ID of the video
     * @return Video struct
     */
    function getVideo(uint256 _videoId) external view returns (Video memory) {
        return videos[_videoId];
    }

    /**
     * @notice Get all published videos for a creator
     * @param _creator Address of the creator
     * @return Array of published videos
     */
    function getPublishedVideosByCreator(address _creator) external view returns (Video[] memory) {
        uint256[] memory videoIds = creatorVideos[_creator];
        uint256 publishedCount = 0;

        // Count published videos
        for (uint256 i = 0; i < videoIds.length; i++) {
            if (videos[videoIds[i]].isPublished) {
                publishedCount++;
            }
        }

        // Create array of published videos
        Video[] memory publishedVideos = new Video[](publishedCount);
        uint256 index = 0;

        for (uint256 i = 0; i < videoIds.length; i++) {
            if (videos[videoIds[i]].isPublished) {
                publishedVideos[index] = videos[videoIds[i]];
                index++;
            }
        }

        return publishedVideos;
    }

    /**
     * @notice Get total number of videos
     * @return Total video count
     */
    function getTotalVideos() external view returns (uint256) {
        return videoCount;
    }
}
