"""Visible floor infills and matching guards; no invisible support floors."""
def seal(name,x,z,w,d,y):
    box('floor-seal-'+name,x,y-.2,z,w,.4,d,surface=True)

def guard(name,x,z,w,d,y):
    box('edge-guard-'+name,x,y+.21,z,w,.42,d,'gold')

# All accessible upper floors now overlap the interior face of the outer wall.
for floor in [6,9.5,13]:
    for side in [-1,1]: seal('perimeter',side*19.39,-1.875,.78,47.75,floor)
for side in [-1,1]: seal('attic-perimeter',side*18.89,1,1.78,43,20)

# Cover the lower sections of stairwells; only the final risers need headroom.
seal('crypt-stair-cover',-12,5.35,3.6,10.7,1)
for x in [-13.8,-10.2]: guard('crypt-side',x,12.35,.12,3.3,1)
guard('crypt-end',-12,10.7,3.6,.12,1)
seal('basement-west-strip',-18.25,-13.75,1.5,12.5,6)
seal('basement-cover',-15.75,-12,3.5,9,6)
for x in [-17.5,-13.9]: guard('basement-side',x,-18.25,.12,3.5,6)
guard('basement-end',-15.7,-16.5,3.6,.12,6)
seal('attic-stair-cover',16,6.15,4,9.3,20)
for x in [14,18]: guard('attic-side',x,12.15,.12,2.7,20)
guard('attic-end',16,10.8,4,.12,20)

# A single solid entrance throat eliminates paths around either gate leaf.
for side in [-1,1]:
    box('gate-throat-wall',side*2.6,8.75,-25.25,2.2,5.5,4.5)
box('gate-upper-closure',0,10.25,-26,3.2,2.5,.4)
