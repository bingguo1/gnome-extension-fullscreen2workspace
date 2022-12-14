const Meta = imports.gi.Meta;

var _handles = [];
var _previousWorkspace = {};

function maximize(act) {
    const win = act.meta_window;
    if (win.window_type !== Meta.WindowType.NORMAL)
        return;
    // If the current workspace doesn't have any other windows make it maximized here.
    if (global.workspace_manager.get_active_workspace().list_windows().length == 1)
        return;
    _previousWorkspace[win.toString()] = global.workspace_manager.get_active_workspace_index();

    // let lastworkspace = global.workspace_manager.n_workspaces;
    // if (lastworkspace < 1)
    //     lastworkspace = 1;
    // win.change_workspace_by_index(lastworkspace, 1);
    // global.workspace_manager.get_workspace_by_index(lastworkspace).activate(global.get_current_time());
    const mMonitor = win.get_monitor();
    const wList = win.get_workspace().list_windows().filter(w => w !== win && !w.is_always_on_all_workspaces() && w.get_monitor() == mMonitor);
    const manager = win.get_display().get_workspace_manager();
    const current = manager.get_active_workspace_index();
    let firstfree = global.workspace_manager.n_workspaces - 1; //this.getFirstFreeMonitor(manager, mMonitor);
    //log("firstfree:" + firstfree);
    manager.reorder_workspace(manager.get_workspace_by_index(firstfree), current);
    // move the other windows to their old places
    wList.forEach(w => { w.change_workspace_by_index(current, false); });
}

function unmaximize(act) {
    const win = act.meta_window;
    if (win.window_type !== Meta.WindowType.NORMAL)
        return;
    let previous = _previousWorkspace[win.toString()];
    if (previous == null || previous == undefined)
        return;
    win.change_workspace_by_index(previous, 1);
    global.workspace_manager.get_workspace_by_index(previous).activate(global.get_current_time());
    //// to make this window above all other applications 
    win.activate(global.get_current_time());
}

function enable() {
    _handles.push(global.window_manager.connect('size-change', (_, act, change) => {
        if (change === Meta.SizeChange.FULLSCREEN) maximize(act);
        if (change === Meta.SizeChange.UNFULLSCREEN) unmaximize(act);
    }));
}

function disable() {
    _handles.splice(0).forEach(h => global.window_manager.disconnect(h));
}