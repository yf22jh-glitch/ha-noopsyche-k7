"""Load protocol modules without importing Home Assistant."""

import sys
import types
from pathlib import Path

COMPONENT_PATH = (
    Path(__file__).parents[1] / "custom_components" / "noopsyche_k7"
)

custom_components = types.ModuleType("custom_components")
custom_components.__path__ = [str(COMPONENT_PATH.parent)]
sys.modules.setdefault("custom_components", custom_components)

component_package = types.ModuleType("custom_components.noopsyche_k7")
component_package.__path__ = [str(COMPONENT_PATH)]
sys.modules.setdefault("custom_components.noopsyche_k7", component_package)
