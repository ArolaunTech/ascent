import os

systemsBodies = {}

systems = os.listdir('bodies')
for system in systems:
	systemBodies = os.listdir('bodies/' + system)
	systemBodies = list(map(lambda x: x[:-4], systemBodies))
	systemsBodies[system] = systemBodies

#print(systemsBodies)
textOut = ''

for system in systemsBodies.keys():
	if os.path.exists('textures/' + system):
		for body in systemsBodies[system]:
			if not os.path.exists('textures/' + system + '/' + body + '_Color.png'):
				print('no color map for ' + body + ' in system: ' + system)
				textOut += '- add color map for ' + body + ' in system: ' + system + '\n'
			if not os.path.exists('textures/' + system + '/' + body + '_Height.png'):
				print('no height map for ' + body + ' in system: ' + system)
				textOut += '- add height map for ' + body + ' in system: ' + system + '\n'
			if not os.path.exists('textures/' + system + '/' + body + '_Normal.png'):
				print('no normal map for ' + body + ' in system: ' + system)
				textOut += '- add normal map for ' + body + ' in system: ' + system + '\n'
	else:
		print(system + ' doesn\'t exist')
		textOut += '- add textures for ' + system + '\n'

saveOutput = ''
yesOptions = ['y', 'yes']
noOptions = ['n', 'no']

while saveOutput.lower() not in yesOptions + noOptions:
	saveOutput = input('Save to-do? [y/n]: ')
saveOutput = saveOutput.lower()
if saveOutput in yesOptions:
	filename = input('Filename for to-do list: ')
	writer = open(filename, 'w')
	writer.write(textOut)
	writer.close()