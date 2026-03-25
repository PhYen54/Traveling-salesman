import itertools
import time
# X = [1,2,3,4]
# X_per = itertools.permutations(X)
# print([per for per in X_per])

#Brute Force
cost = [[0, 18719, 19101.8, 19483.5, 18129.6], [20914.7, 0, 1305.1, 1613.9, 912.3], [21470, 1503, 0, 1799.5, 2026.2], [20996.7, 860.2, 1172.4, 0, 1524.5], [19706.5, 928.4, 1977.8, 2286.5, 0]]  
def find_visited(cost):

    cities = list(range(len(cost)))

    permutation_cities = itertools.permutations(cities[1:])
    permutation_cities = [[cities[0]] + list(per) + [cities[0]] for per in permutation_cities]

    min_resolve = float('inf')
    res = []
    for per in permutation_cities:

        cost_visit = 0
        path = [0]
        
        for i in range(len(per[:-1])):

            cost_visit += cost[per[i]][per[i+1]]
            path.append(per[i+1])

        if min_resolve > cost_visit:
            min_resolve = cost_visit
            res = path
        
    return min_resolve, res

print(find_visited(cost))


