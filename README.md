# Developer Notes
### 7/29
Implementing allowing user to make request.
To do this, the scheduling algorithm needs to know which `user_priority` is left to use.
- Make a scheduling algorithm to return unused `user_priority` for a given `user_id`.
    - To achieve this, we should update `priorirty_computed` in `request` table when approving requests.

### 7/30
Right now the algorithm does not return all shifts but shifts with a request. I need to fix this so that the frontend day selection UI works properly.
- Need to fix how the algorithm creates `monthdata`

1. Add sending request to the backend function.