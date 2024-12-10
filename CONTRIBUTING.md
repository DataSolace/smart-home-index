# Contributing Self-Hosting Notes

Thank you for contributing to Smart Home Index! Our goal is to build a comprehensive resource of self-hosting notes for smart home devices.
These notes help others understand how to locally control and integrate their devices.

## Quick Start

1. Fork the repository (and clone it locally if you're editing on your own machine)
2. Create a branch for your notes, named something relevant like `add-shelly-em3`
3. Add your self-hosting notes in `notes.md`under the correct manufacturer and device directory
    1. If the manufacturer or device don't exist, feel free to create the directory with a `info.md` file containing basic information about the manufacturer or device (this is optional, but will help speed up the process of adding the device to the index)
4. Submit a Pull Request

> **Not comfortable with Git?** No problem! Just open an issue with your notes and we'll handle adding them to the repository for you. Make sure to let us know how you'd like to be credited (GitHub username, website, etc.).

## Detailed Process

### 1. Fork & Clone
```bash
# Fork via GitHub UI, then:
git clone https://github.com/YOUR-USERNAME/smart-home-index.git
cd smart-home-index
```

### 2. Find or Create Device Directory

Navigate to the correct location following this structure:
```
manufacturers/
└── manufacturer_name/
    ├── notes.md (optional)
    └── device_name/
        ├── notes.md
        └── info.md (optional)
```

If the manufacturer or device directories don't exist:
```bash
mkdir -p manufacturers/manufacturer_name/device_name
```

### 3. Add Your Notes

Create `notes.md` in the device directory. Your notes should focus on practical self-hosting information. There is no target length, they can be as long or short as you'd like. Here are some key topics to consider including:

#### Essential Information
- Hardware model and variants covered
- Firmware versions you've tested
- Any additional hardware requirements

#### Local Control Details
- What protocols are available (MQTT, REST/HTTP, etc.)
- Required network ports and configurations
- Any specific network requirements or limitations

#### Setup Process
Share your experience with:
- Initial setup steps
- Flashing custom firmware (if applicable)
- Network configuration
- Common pitfalls and solutions

#### Home Assistant Integration
If applicable, include working configuration examples or links to HACS integrations

#### Helpful Information
- Known issues you've encountered
- Successful workarounds
- Tips for reliable operation
- Useful tools or scripts
- Links to relevant documentation or community resources
- Links to blogs or other publicly available content you've written about the device

#### Sign Off Your Notes

Feel free to add whichever social links you'd like associated with your notes. Add as many as you like in a blank line after your notes.

*Remember: These are guidelines, not requirements. Include what you think will be most helpful to others trying to self-host this device.*

#### Adding Notes to Existing Device

If a device already has notes, separate your notes from the existing ones with a `---` [horizontal rule](https://www.markdownguide.org/basic-syntax/#horizontal-rules).

For example:

```markdown
# manufacturers/manufacturer_name/device_name/notes.md

Existing notes...

[biodrone](https://github.com/biodrone)

---

New notes...

[Tombo1001](https://github.com/Tombo1001)
```

#### Adding Notes for a New Device

Consider adding an `info.md` with basic details:
- Brief overview of the manufacturer/device
- Key features
- Relevant links to official resources

This will help speed us up when adding the device to the index.
We'll give you credit for the devices/manufacturer you added in the support too!

#### Adding Notes About a Manufacturer

If adding specific notes about a manufacturer, please include a `notes.md` file in the manufacturer directory.
These will mostly be used as warnings to others on the index, but if there's reasons to use them for positive notes too, we're open to it!

Examples for this include manufacturers:
- being acquired by another company
- closing their API
- being hostile to the DIY smart home community

### 4. Submit Changes

```bash
git checkout -b add-device-name
git add manufacturers/manufacturer_name/device_name/notes.md
git commit -m "Add self-hosting notes for [Device Name]"
git push origin add-device-name
```

Create a Pull Request via GitHub and include details such as:
- How long you've been self-hosting this device
- Your overall experience
- Any specific challenges you solved

### 5. Commit Message Standards

We follow the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/) for our commit messages. This helps keep our commit history clean and machine-readable. The basic structure is:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Common types include:
- `feat`: New feature (like adding device notes or manufacturer information)
- `fix`: Bug fix (correcting incorrect information)
- `docs`: Internal documentation changes (like updating this CONTRIBUTING.md)
- `chore`: Maintenance tasks
- `refactor`: Reorganizing existing content without changing its meaning

Examples:
```
feat: add Shelly EM3 self-hosting notes
fix: correct MQTT topic for Inovelli dimmers
feat(aqara): add manufacturer information
docs: update contribution guidelines
chore: fix typos in multiple device notes
```

## Guidelines

### Do
- Focus on local control methods
- Include specific firmware versions tested
- Document required network configuration
- Share working configuration examples
- Add troubleshooting tips

### Don't
- Share sensitive information (tokens, passwords)
- Submit untested configurations

## Need Help?

- Open an issue for questions
- Check existing notes for examples
- Join our community discussions
