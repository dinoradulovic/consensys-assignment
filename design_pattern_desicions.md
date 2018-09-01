# Design pattern decisions

Open Zeppelin library is used in order to implement **Access Restriction** (Ownable contract) and **Emergency Stop** (Pausable contract) patterns.

Also, **Pull over Push** pattern is implemented in order to move the risk of the ether transfer from the Store contract to the users(withdrawal).

I also made sure that user inputs are validated and that contract is in right state to ensure the logic is functioning properly. (**Guard Check** pattern)

