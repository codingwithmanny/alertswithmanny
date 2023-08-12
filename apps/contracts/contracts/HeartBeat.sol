// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// Imports
// ========================================================
import "@api3/contracts/v0.8/interfaces/IProxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Main Contract
// ========================================================
contract HeartBeat is Ownable, IProxy {
    /**
     * @dev Address of the proxy contract
     */
    int224 private ethUSD;
    uint32 private timestamp;

    /**
     * @dev Address of the proxy contract
     */
    function write(int224 _value) public onlyOwner {
        ethUSD = _value;
        timestamp = uint32(block.timestamp);
    }

    /**
     * @dev Reads the data feed
     */
    function read() external view returns (int224 value, uint32 entryTimestamp) {
        (value, entryTimestamp) = (ethUSD, timestamp);
    }

    /**
     * @dev Returns the address of the API3 server
     */
    function api3ServerV1() external view returns (address) {
        return address(this);
    }
}
