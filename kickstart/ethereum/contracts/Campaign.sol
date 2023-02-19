// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint _minimumContribution) public {
        Campaign newCampaign = new Campaign(msg.sender, _minimumContribution);
        deployedCampaigns.push(address(newCampaign));
    }

    function getDeployedCampaigns() public view returns(address[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }

    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    mapping(uint => Request) public requests;
    uint public approversCount;
    uint private requestsCount;

    modifier onlyManager(){
        require(msg.sender == manager);
        _;
    }

    constructor(address _manager, uint _minimumContribution) {
        manager = _manager;
        minimumContribution = _minimumContribution;
    }

    function contribute() public payable{
        require(msg.value >= minimumContribution);
        approvers[msg.sender] = true;
        approversCount++;
    }

    function createRequest(string memory _description, uint _value, address _recipient) public onlyManager {
        Request storage newRequest = requests[requestsCount++];
        newRequest.description = _description;
        newRequest.value = _value;
        newRequest.recipient = _recipient;
        newRequest.complete = false;
        newRequest.approvalCount = 0;
    }

    function approveRequest(uint index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint index) public onlyManager {
        Request storage request = requests[index];

        require(!request.complete);
        require(request.approvalCount * 2 >= approversCount);

        payable(request.recipient).transfer(request.value);
        request.complete = true;
    }

    function getSummary() public view returns (uint, uint, uint, uint, address) {
      return (
        minimumContribution,
        address(this).balance,
        requestsCount,
        approversCount,
        manager
      );
    }

    function getRequestCount() public view returns (uint) {
      return requestsCount;
    }
}
