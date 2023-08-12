// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// Imports
// ========================================================
import "@api3/contracts/v0.8/interfaces/IProxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Main Contract
// ========================================================
contract DAPIFeed is Ownable {
    /**
     * @dev Address of the proxy contract
     */
    address public proxyAddress;

    /**
     * @dev Sets the address of the proxy contract
     */
    function setProxyAddress(address _proxyAddress) public onlyOwner {
        proxyAddress = _proxyAddress;
    }

    /**
     * @dev Reads the data feed
     */
    function readDataFeed()
        external
        view
        returns (int224 value, uint256 timestamp)
    {
        (value, timestamp) = IProxy(proxyAddress).read();
    }
}
